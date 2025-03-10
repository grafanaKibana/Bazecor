import log from "electron-log/renderer";
import { DygmaDeviceType } from "@Renderer/types/dygmaDefs";
import { ExtHIDInterface } from "../comms/types";
import Hardware from "../hardware";

const DygmavendorID = 13807;
const DygmaproductID = [18, 33];
const HIDReportID = 5;
const DygmaUsage = 1;
const DygmaUsagePage = 65280;

type ReceiverHandler = (dataReceived: string) => void;
type ErrorHandler = (err: Error) => void;

class HIDError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "HIDError";
  }
}

class HID {
  connectedDevice: HIDDevice;
  private devices: Array<HIDDevice>;
  private dataReceived: string;
  private static encoder: TextEncoder;
  private static decoder: TextDecoder;
  serialNumber: string;

  constructor() {
    this.connectedDevice = null;
    this.devices = [];
    this.dataReceived = "";
    this.serialNumber = "";
    if (!HID.encoder || !HID.decoder) {
      HID.encoder = new TextEncoder();
      HID.decoder = new TextDecoder();
    }
  }

  static getDevices = async (): Promise<HIDDevice[]> => {
    const grantedDevices = await navigator.hid.getDevices();
    const filteredDevices = grantedDevices.filter(
      dev => dev.vendorId === DygmavendorID && DygmaproductID.includes(dev.productId),
    );
    const foundDevices: ExtHIDInterface[] = [];

    filteredDevices.forEach(device => {
      let name;
      let wireless = true;
      let layout = "ANSI";
      if (device.productName.includes("Raise2")) {
        const [nme, wless, ly] = device.productName.split(" ")[0].split("-");
        name = nme;
        wireless = wless.includes("Wless");
        layout = ly.includes("I") ? "ISO" : "ANSI";
        log.info("Raise2 Data", name, wireless, layout);
      }
      for (const Hdevice of Hardware.serial) {
        if (device.productId === Hdevice.usb.productId && device.vendorId === Hdevice.usb.vendorId) {
          if (device.productId === 33) {
            if (Hdevice.info.keyboardType === layout) {
              const newHID: ExtHIDInterface = device;
              newHID.device = Hdevice as DygmaDeviceType;
              foundDevices.push(newHID);
            }
          } else {
            const newHID: ExtHIDInterface = device;
            newHID.device = Hdevice as DygmaDeviceType;
            foundDevices.push(newHID);
          }
        }
      }
    });
    log.info("Usable found devices:", foundDevices);
    return foundDevices;
  };

  connectDevice = async (index: number) => {
    // if we are already connected, we do not care and connect again
    log.info("Trying to connect HID");
    if (this.connectedDevice) {
      throw new HIDError("Device already connected");
    }

    const timeoutPromise = new Promise((_, reject) => {
      setTimeout(() => {
        reject(new Error("Timeout exceeded while waiting for device."));
      }, 500);
    });

    const connectPromise = Promise.race([
      navigator.hid.requestDevice({
        filters: [
          {
            vendorId: DygmavendorID,
            productId: DygmaproductID[0],
            usage: DygmaUsage,
            usagePage: DygmaUsagePage,
          },
          {
            vendorId: DygmavendorID,
            productId: DygmaproductID[1],
            usage: DygmaUsage,
            usagePage: DygmaUsagePage,
          },
        ],
      }),
      timeoutPromise,
    ]);
    try {
      const devices = (await connectPromise) as HIDDevice[];
      log.info("list of devices: ", devices);
      if (devices.length > 0) {
        const connectedDevice = devices[index];
        this.connectedDevice = connectedDevice;
        return connectedDevice;
      }
      throw new HIDError("No HID Devices to connect");
    } catch (err) {
      throw new HIDError("HID Device could not be connected");
    }
  };

  isDeviceConnected = (index: number) => {
    // if (process.platform !== "linux") return true;
    // try {
    //   fs.accessSync(device.path, fs.constants.R_OK | fs.constants.W_OK);
    // } catch (e) {
    //   return false;
    // }
    log.info("checking if device is connected: ", index, this.isConnected());
    return true;
  };

  isDeviceSupported = async (index: number) => {
    // if (!device.device.isDeviceSupported) {
    log.info("checking if device is supported: ", index);
    try {
      await this.connectDevice(index);
      await this.open();
      let chipid = "";
      await this.sendData(
        "hardware.chip_id\n",
        rxData => {
          chipid = rxData;
        },
        err => {
          log.info(err);
        },
      );
      this.serialNumber = chipid;
    } catch (error) {
      log.warn("Error when checking support: ", error);
      return false;
    }
    return true;
  };

  connect = async () => {
    try {
      await this.open();
    } catch (error) {
      log.info("Not able to connect to device", error);
    }
  };

  open = async () => {
    if (this.isConnected() && !this.isOpen()) {
      await this.connectedDevice.open();
      log.info("Device open");
      log.info(this.connectedDevice);
      return;
    }
    if (!this.isConnected()) {
      throw new HIDError("No connected device to open");
    }
  };

  close = async () => {
    if (this.isOpen()) {
      await this.connectedDevice.close();
    } else {
      throw new HIDError("Device is not open, no need to close");
    }
  };

  isConnected = () => {
    if (this.connectedDevice) {
      return true;
    }
    return false;
  };

  isOpen = () => this.isConnected() && this.connectedDevice.opened;

  static purgeUselessCharsEnd = (str: string) => {
    // we remove null char and whitespaces from the end of the data received
    const nullCharacterRegex = new RegExp("\u0000", "g");
    const strWithoutNull = str.replace(nullCharacterRegex, "").trimEnd();
    const dataArray = strWithoutNull.split(" ");
    const lastItem = dataArray[dataArray.length - 1];
    const lastItemChar = lastItem.charCodeAt(0);
    if (lastItemChar === 0 || Number.isNaN(lastItemChar)) {
      dataArray.pop();
    }
    const rejoined = dataArray.join(" ");
    return rejoined;
  };

  sendData = async (dataToSend: string, receiverHandler: ReceiverHandler, errorHandler: ErrorHandler) => {
    const maxData = 200;
    this.dataReceived = "";
    const encodedData = HID.encoder.encode(dataToSend);
    const chunks = Math.ceil(encodedData.length / maxData);
    let startIndex;
    let endIndex;
    if (!this.isOpen) {
      throw new HIDError("No open device");
    }
    // we declare the handler here so we can use it when we resolve the promise
    let receiveDataHandler: (event: HIDInputReportEvent) => void;
    const allDataReceived = new Promise((resolve, reject) => {
      const timeout = setTimeout(() => {
        if (this.connectedDevice) {
          this.connectedDevice.removeEventListener("inputreport", receiveDataHandler);
        }
        reject(new HIDError("HID send data took too much time"));
      }, 5000);
      receiveDataHandler = (event: HIDInputReportEvent) => {
        // we cannot differentiate if the user has several defys
        const { data, device, reportId } = event;

        if (!DygmaproductID.includes(device.productId) && reportId !== HIDReportID) return;

        const decodedData = HID.decoder.decode(data);
        if (decodedData.includes("\r\n.\r\n")) {
          const lastChunk = decodedData.replace("\r\n.\r\n", "");
          this.dataReceived += lastChunk;
          this.dataReceived = HID.purgeUselessCharsEnd(this.dataReceived);
          clearTimeout(timeout);
          resolve(this.dataReceived);
        } else {
          this.dataReceived += decodedData;
        }
      };
      this.connectedDevice.addEventListener("inputreport", receiveDataHandler);
    });
    const buffer = new ArrayBuffer(maxData);
    let bufferView;
    for (let i = 0; i < chunks; i += 1) {
      startIndex = maxData * i;
      endIndex = maxData * i + maxData;
      bufferView = new Uint8Array(buffer);
      bufferView.fill(0);
      bufferView.set(encodedData.slice(startIndex, endIndex), 0);
      this.sendChunkData(bufferView);
    }
    return allDataReceived
      .then((totalDataReceived: string) => {
        this.connectedDevice.removeEventListener("inputreport", receiveDataHandler);
        receiverHandler(totalDataReceived);
      })
      .catch(err => errorHandler(err));
  };

  private sendChunkData = async (data: Uint8Array) => {
    await this.connectedDevice.sendReport(HIDReportID, data);
  };
}

export default HID;

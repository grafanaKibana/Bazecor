/* eslint-disable no-nested-ternary */
/* eslint-disable react/jsx-filename-extension */
/*
 * SVG keyboard representation for key picking
 * Made by Alejandro Parcet González From Dygma S.L.
 */

import React from "react";
import Styled, { useTheme } from "styled-components";

import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@Renderer/components/atoms/Tooltip";

import { RiStopFill } from "react-icons/ri";
import { IoIosPause, IoIosPlay, IoIosShuffle } from "react-icons/io";
import { FiMenu } from "react-icons/fi";
import { CgToggleOff } from "react-icons/cg";
import { TiCancel } from "react-icons/ti";
import { ImTab } from "react-icons/im";
import { BsFillBrightnessAltLowFill, BsShift, BsBackspace } from "react-icons/bs";
import { FaVolumeDown, FaVolumeMute, FaVolumeUp, FaLinux } from "react-icons/fa";
import {
  BiArrowFromBottom,
  BiArrowFromLeft,
  BiArrowFromRight,
  BiArrowFromTop,
  BiDownArrowCircle,
  BiLeftArrowCircle,
  BiMouseAlt,
  BiRightArrowCircle,
  BiUpArrowCircle,
} from "react-icons/bi";
import {
  AiFillForward,
  AiFillWindows,
  AiOutlineArrowDown,
  AiOutlineArrowLeft,
  AiOutlineArrowRight,
  AiOutlineArrowUp,
  AiOutlineBackward,
  AiOutlineForward,
} from "react-icons/ai";
import { MdKeyboardReturn, MdSpaceBar, MdKeyboardCapslock, MdInfoOutline, MdEject } from "react-icons/md";

import Key, { KeyProps } from "@Renderer/modules/KeyPickerKeyboard/Key";
import OSKey from "@Renderer/components/molecules/KeyTags/OSKey";
import getLanguage, { LangOptions } from "@Renderer/modules/KeyPickerKeyboard/KeyPickerLanguage";
import { getKeyboardLayout } from "@Renderer/utils/getKeyboardLayout";
import { SegmentedKeyType } from "@Renderer/types/layout";

const Style = Styled.div`
width: 100%;
.keyboard {
  margin: 0;
  padding: 16px;
  .keys {
    margin: 0;
    padding: 0;
    justify-content:center;
  }
  .bigger {
    font-size: 1.3rem;
  }
  .biggerWin {
    font-size: 1.2rem;
  }
  .biggerApple {
    font-size: 1.3rem;
  }
  .biggerLinux {
    font-size: 1.3rem;
  }
}
.svgStyle {
    overflow: visible;
    max-width: 1170px;
    margin: 6px auto;
}
.keysOrdinaryKeyboard {
  position: relative;
  z-index: 4;
}


.KeysWrapper {
  max-width: 1260px;
  margin: auto;
}
.keysContainer + .keysContainer {
  margin-top: 8px;
}
.KeysWrapperSpecialKeys {
  margin-top: 8px;
}
.keysRow {
  display: flex;
  flex-wrap: nowrap;

  border-radius: 6px;
  padding: 5px;
  &.keysOrdinaryKeyboard {
    padding: 12px 0;
  }
  .keyIcon {
    flex: 0 0 42px;
    text-align: center;
    align-self: center;
    color: ${({ theme }) => theme.styles.keyPicker.iconColor};
    h4 {
      font-size: 11px;
      font-weight: 700;
      letter-spacing: 0.06em;
      margin: 0;
    }
  }
  .keyTitle {
    font-size: 11px;
    color: ${({ theme }) => theme.styles.keyPicker.titleColor};
    display: flex;
    // flex-grow: 1;
    align-self: center;
    line-height: 1.15em;
    flex-wrap: wrap;
    // max-width: 66px;
    span {
      color: ${({ theme }) => theme.styles.keyPicker.titleSpan};
      display: block;
      flex: 0 0 100%;
    }
    &.keyTitleClick {
      padding-left: 16px;
      padding-right: 10px;
    }
  }
}
.keysMediaTools {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  grid-gap: 16px;
}
.keysContainerDropdowns {
  display: grid;
  grid-template-columns: minmax(25%, auto) minmax(25%, auto) minmax(25%, auto);
  grid-gap: 16px;
}

.dropdownItem {
  overflow: hidden;
  white-space: nowrap;
  text-overflow: ellipsis;
}
.dropdown-toggle.btn.btn-primary {
  padding-right: 24px;
  padding-left: 8px;
}
.dropdown-toggle::after {
  right: 12px;
}
.keyRowsDropdowns {
  display: grid;
  grid-template-columns: minmax(42px, 42px) minmax(0, 1fr);
}
.keysButtonsList {
  display: flex;
  flex-direction: row;
  flex-grow: 1;
  flex: calc(100% - 42px);
}
.keysButtonsList .button-config {
  margin-left: 3px;
  height: 34px;
  display: flex;
  flex-grow: 1;
  text-align: center;
  padding: 5px 3px;
  justify-content: center;
  font-size: 14px;
}
.keysMouseEvents .button-config {
  width: 58px;
}


.colSuperKeysMacros { grid-area: colSuperKeysMacros; }
.colLayers { grid-area: colLayers; }
.colNoKeyLED { grid-area: colNoKeyLED; }
.colOneShotModifiers { grid-area: colOneShotModifiers; }
.colMedia { grid-area: colMedia; }
.colTools { grid-area: colTools; }

.dropdown-menu.show {
  overflow-y: auto;
  height: 190px;
}

.editor {
  .keysLED .button-config {
    svg {
      margin-right: 0;
    }
    .buttonLabel {
      display: none;
    }
  }
  .keysContainerGrid {
    display: grid;
    grid-template-columns: minmax(0, 1fr) minmax(0, 1fr) minmax(0, 1fr) minmax(0, 1fr);
    grid-template-rows: 1fr 1fr 1fr;
    gap: 8px 16px;
    grid-template-areas:
      "colSuperKeysMacros colSuperKeysMacros colLayers colLayers"
      "colNoKeyLED colNoKeyLED colOneShotModifiers colOneShotModifiers"
      "colMedia colMedia colTools colTools";

    .colSuperKeysMacros {
      display: grid;
      grid-template-columns: minmax(0, 1fr) minmax(0, 1fr);
      grid-template-rows: 1fr;
      gap: 0px 16px;
      grid-area: colSuperKeysMacros;
    }
    .colLayers {
      grid-area: colLayers;
    }
    .colNoKeyLED {
      display: grid;
      grid-template-columns: 1fr 1fr;
      grid-template-rows: 1fr;
      gap: 0px 16px;
      grid-area: colNoKeyLED;
    }
    .colOneShotModifiers { grid-area: colOneShotModifiers; }
    .colMedia { grid-area: colMedia; }
    .colTools { grid-area: colTools; }
  }
  .dropdownLayerShift .dropdown-toggle.btn.btn-primary,
  .dropdownOneShotModifiers .dropdown-toggle.btn.btn-primary{
    border-top-right-radius: 0;
    border-bottom-right-radius: 0;
  }
  .dropdownLayerLock .dropdown-toggle.btn.btn-primary,
  .dropdownOneShotLayers .dropdown-toggle.btn.btn-primary{
    border-top-left-radius: 0;
    border-bottom-left-radius: 0;
  }
}
.super {
  .keysContainerGrid {
    display: grid;
    grid-template-columns:  0.8fr 1fr 1fr 1fr 1.2fr 0.25fr 1.75fr 1fr;

    grid-template-rows: 1fr 1fr;
    gap: 8px 16px;
    grid-template-areas:
      "colSuperKeysMacros colSuperKeysMacros colSuperKeysMacros colLayers colLayers colLayers colNoKeyLED colNoKeyLED"
      "colMedia colMedia colMedia colMedia colTools colTools colTools colTools";
  }
  .keysRow {
    height: 100%;
    align-items: center;
  }
}
`;
const IconColor = Styled.span`
    color: ${props => props.color};
`;

interface Props {
  code: SegmentedKeyType;
  disableMods: boolean;
  disableMove: boolean;
  disableAll: boolean;
  selectedlanguage: LangOptions;
  showSelected: boolean;
  onKeySelect: (value: number) => void;
}

const KeyPickerReduced = (props: Props) => {
  const theme = useTheme();
  const { code, disableMods, disableMove, disableAll, selectedlanguage, showSelected, onKeySelect } = props;

  const onKeyPress = (keycode: number) => {
    onKeySelect(keycode);
  };

  const renderTooltip = (tooltips: string[]) => (
    <>
      {tooltips.map((tip: string, i: number) => (
        <React.Fragment key={`Tip-${String(i)}`}>
          {i % 2 === 1 || !Number.isNaN(tip[0]) || tip[0] === "-" ? (
            <p className="ttip-p">{tip}</p>
          ) : (
            <>
              {i === 0 ? "" : <br />}
              <h5 className="ttip-h">{tip}</h5>
            </>
          )}
        </React.Fragment>
      ))}
    </>
  );
  const Lang: KeyProps[] = getLanguage(selectedlanguage);
  const keyboardLayout = getKeyboardLayout(selectedlanguage);

  const os = process.platform;
  const iconlist: { [key: string]: React.JSX.Element } = {
    Backspace: <BsBackspace />,
    Enter: <MdKeyboardReturn />,
    Space: <MdSpaceBar />,
    CapsLock: <MdKeyboardCapslock />,
    Tab: <ImTab />,
    Shift: <BsShift />,
    App: <FiMenu />,
    Win:
      os === "win32" ? (
        <AiFillWindows className="biggerWin" />
      ) : os === "darwin" ? (
        <OSKey renderKey="os" />
      ) : (
        <FaLinux className="biggerLinux" />
      ),
    ArrUp: <AiOutlineArrowUp className="bigger" />,
    ArrDwn: <AiOutlineArrowDown className="bigger" />,
    ArrLeft: <AiOutlineArrowLeft className="bigger" />,
    ArrRight: <AiOutlineArrowRight className="bigger" />,
    LDToggl: (
      <>
        <BsFillBrightnessAltLowFill className="bigger" />
        <CgToggleOff className="" />
      </>
    ),
    LDForward: (
      <>
        <BsFillBrightnessAltLowFill className="bigger" />
        <AiOutlineForward className="" />
      </>
    ),
    VolAdd: <FaVolumeUp className="bigger" />,
    VolSub: <FaVolumeDown className="bigger" />,
    VolMute: <FaVolumeMute className="bigger" />,
    Pause: <IoIosPause className="bigger" />,
    Play: <IoIosPlay className="bigger" />,
    Stop: <RiStopFill className="bigger" />,
    Eject: <MdEject className="bigger" />,
    Shuffle: <IoIosShuffle className="bigger" />,
    Forward: <AiFillForward className="bigger" />,
    Backward: <AiOutlineBackward className="bigger" />,
    Cancel: <TiCancel className="bigger" />,
    ScrlUp: (
      <>
        <BiMouseAlt className="bigger" />
        <BiArrowFromBottom className="" />
      </>
    ),
    ScrlDwn: (
      <>
        <BiMouseAlt className="bigger" />
        <BiArrowFromTop className="" />
      </>
    ),
    ScrlLeft: (
      <>
        <BiMouseAlt className="bigger" />
        <BiArrowFromRight className="" />
      </>
    ),
    ScrlRight: (
      <>
        <BiMouseAlt className="bigger" />
        <BiArrowFromLeft className="" />
      </>
    ),
    MvUp: (
      <>
        <BiMouseAlt className="bigger" />
        <BiUpArrowCircle className="" />
      </>
    ),
    MvDwn: (
      <>
        <BiMouseAlt className="bigger" />
        <BiDownArrowCircle className="" />
      </>
    ),
    MvLeft: (
      <>
        <BiMouseAlt className="bigger" />
        <BiLeftArrowCircle className="" />
      </>
    ),
    MvRight: (
      <>
        <BiMouseAlt className="bigger" />
        <BiRightArrowCircle className="" />
      </>
    ),
  };
  const keyboard = Lang.map((key: KeyProps, id) => {
    if (key.tooltip) {
      return (
        <foreignObject key={`id-${key.content.first}-${String(id)}`} x={key.x} y={key.y} width={25} height={25}>
          <TooltipProvider delayDuration={100}>
            <Tooltip>
              <TooltipTrigger className="[&_svg]:text-purple-100 [&_svg]:dark:text-purple-200">
                <MdInfoOutline className="info" />
              </TooltipTrigger>
              <TooltipContent>{renderTooltip(key.tooltip)}</TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </foreignObject>
      );
    }
    return (
      <Key
        key={`id-${key.content.first}-${String(id)}`}
        id={id}
        x={key.x}
        y={key.y}
        selected={
          showSelected
            ? code === null
              ? false
              : Array.isArray(key.idArray)
                ? key.idArray.some(
                    ArrayID =>
                      ArrayID === code.base + code.modified || (ArrayID === code.base && ArrayID >= 104 && ArrayID <= 115),
                  )
                : code.base === key.id &&
                    (code.base + code.modified < 53267 || code.base + code.modified > 60000) &&
                    (code.base + code.modified < 17450 || code.base + code.modified > 17501) &&
                    (code.base + code.modified < 49153 || code.base + code.modified > 49168)
                  ? true
                  : !!(code.modified > 0 && code.base + code.modified === key.id)
            : false
        }
        clicked={() => {
          if (!((key.mod === disableMods && key.tap !== true) || key.move === disableMove)) onKeyPress(key.id);
        }}
        onKeyPress={onKeyPress}
        centered={key.centered}
        content={key.content}
        iconpresent={!!key.icon}
        icon={
          <IconColor
            color={
              key.mod === disableMods || key.move === disableMove
                ? theme.keyboardPicker.keyTextDisabledColor
                : theme.keyboardPicker.keyIconColor
            }
          >
            {iconlist[key.iconname]}
          </IconColor>
        }
        iconx={key.iconx}
        icony={key.icony}
        iconsize={key.iconsize}
        disabled={(key.mod === disableMods && key.tap !== true) || key.move === disableMove || disableAll}
        idArray={key.idArray}
        keyCode={code}
        platform={process.platform}
      />
    );
  });
  return (
    <Style>
      <div className="KeysWrapper">
        <div className="keysContainer">
          <div className="keysRow keysOrdinaryKeyboard">
            <svg
              className={`svgStyle ${process.platform} ${keyboardLayout}`}
              viewBox="0 0 1070 208"
              preserveAspectRatio="xMidYMin slice"
            >
              {keyboard}
              <defs>
                <linearGradient id="paint_gradient" x1="0%" y1="0%" x2="100%" y2="0%">
                  <stop offset="5%" stopColor="#fff" />
                  <stop offset="95%" stopColor="#fff" stopOpacity={0} />
                </linearGradient>
                <filter id="filter0_d_2211_181319" x="0%" y="0%" width="200%" height="200%">
                  <feOffset result="offOut" in="SourceGraphic" dx="0" dy="-2" />
                  <feColorMatrix
                    result="matrixOut"
                    in="offOut"
                    type="matrix"
                    values="0 0 0 0 0.552941 0 0 0 0 0.517647 0 0 0 0 0.737255 0 0 0 0.1 0"
                  />
                  <feGaussianBlur result="blurOut" in="matrixOut" stdDeviation="0" />
                  <feBlend in="SourceGraphic" in2="blurOut" mode="normal" />
                </filter>
              </defs>
            </svg>
          </div>
        </div>
      </div>
    </Style>
  );
};

export default KeyPickerReduced;

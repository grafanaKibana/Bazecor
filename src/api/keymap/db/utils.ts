/* bazecor-keymap -- Bazecor keymap library
 * Copyright (C) 2018  Keyboardio, Inc.
 * Copyright (C) 2019  DygmaLab SE
 *
 * This program is free software: you can redistribute it and/or modify it under
 * the terms of the GNU General Public License as published by the Free Software
 * Foundation, version 3.
 *
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU General Public License for more details.
 *
 * You should have received a copy of the GNU General Public License
 * along with this program.  If not, see <http://www.gnu.org/licenses/>.
 */

import { KeymapCodeTableType } from "../types";

function withModifiers(
  table: {
    keys: Array<KeymapCodeTableType>;
    groupName: string;
  },
  groupName: string,
  top: string | JSX.Element,
  base: number,
) {
  return {
    groupName,
    keys: table.keys.map(key => ({
      code: key.code + base,
      labels: {
        top,
        primary: key.labels.primary,
      },
    })),
  };
}

enum ModifierCodes {
  CONTROL = 256,
  ALT = 512,
  CONTROL_ALT = 768,
  ALTGR = 1024,
  SHIFT = 2048,
  ALTGR_SHIFT = 3072,
  OS = 4096,
}

export { withModifiers, ModifierCodes };

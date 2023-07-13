import * as React from 'react'
import * as menu from '@zag-js/menu'
import clsx from 'clsx'
import chevronDown from '../assets/chevron-down.svg'
import threeDots from '../assets/three-dots.svg'
import classes from './styles.module.css'
import {useMachine, normalizeProps} from '@zag-js/react'

export interface ButtonProps {
  children: React.ReactNode
  variant?: 'primary' | 'secondary' | 'ghost' | 'danger'
  disabled?: boolean
  onClick?: React.MouseEventHandler<HTMLButtonElement>
}

// 1. Button => primary, secondary, ghost
// 2. Button Group => primary
// 2. Button Menu => primary

export function Button({children, variant = 'primary', disabled = false, onClick}: ButtonProps) {
  return (
    <button
      className={clsx(
        classes.btn,
        variant === 'primary' && classes.btnPrimary,
        variant === 'secondary' && classes.btnSecondary,
        variant === 'ghost' && classes.btnGhost,
        variant === 'danger' && classes.btnDanger,
        disabled && classes.disabled,
      )}
      disabled={disabled}
      onClick={onClick}
    >
      {children}
    </button>
  )
}

export interface MenuButtonProps {
  id?: string
  children: React.ReactNode
  variant?: 'primary' | 'secondary' | 'ghost'
  disabled?: boolean
  menuItems: {label: string; iconSrc?: string; onClick: any}[]
  onClick?: React.MouseEventHandler<HTMLButtonElement>
  isCustomTrigger?: boolean
  // exists on why it's a custom trigger, used to pass the whole row
  customData?: any
}

function MenuButton({
  id = 'hui-menu-button',
  children,
  variant = 'primary',
  disabled = false,
  menuItems,
  onClick,
  isCustomTrigger = false,
  customData,
}: MenuButtonProps) {
  const [state, send] = useMachine(menu.machine({id, positioning: {placement: 'bottom-end'}}))
  const api = menu.connect(state, send, normalizeProps)

  return (
    <div>
      {isCustomTrigger ? (
        <button
          className={clsx(
            'reset-btn',
            classes.customTrigger,
            api.isOpen && classes.customTriggerActive,
          )}
          {...api.triggerProps}
        >
          {children}
        </button>
      ) : (
        <div className={classes.btnGrp}>
          <button
            className={clsx(
              classes.btn,
              classes.btnMenu,
              variant === 'primary' && classes.btnPrimary,
              variant === 'secondary' && classes.btnSecondary,
              variant === 'ghost' && classes.btnGhost,
              disabled && classes.disabled,
            )}
            disabled={disabled}
            onClick={onClick}
          >
            {children}
          </button>

          <button
            {...api.triggerProps}
            className={clsx(
              classes.btn,
              classes.btnAddon,
              variant === 'primary' && classes.btnPrimary,
              variant === 'primary' && classes.btnAddonPrimary,
              variant === 'secondary' && classes.btnSecondary,
              variant === 'secondary' && classes.btnAddonSecondary,
              variant === 'ghost' && classes.btnGhost,
              variant === 'ghost' && classes.btnAddonGhost,
              disabled && classes.disabled,
            )}
            disabled={disabled}
          >
            <img
              src={chevronDown}
              alt="chevron down"
              className={clsx(
                variant === 'primary' && classes.btnImgPrimary,
                variant === 'secondary' && classes.btnImgSecondary,
                variant === 'ghost' && classes.btnImgGhost,
              )}
            />
          </button>
        </div>
      )}

      <div {...api.positionerProps} style={{zIndex: 1}}>
        <div {...api.contentProps} className={classes.menus}>
          {menuItems.map(menu => (
            <div
              key={menu.label}
              className={classes.menu}
              {...api.getItemProps({id: menu.label.toLowerCase()})}
              onClick={isCustomTrigger ? () => menu.onClick(customData) : menu.onClick}
            >
              {menu.iconSrc && <img src={menu.iconSrc} className={classes.menuIcon} />}
              {menu.label}
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
export interface MenuActionsDropdownProps {
  id: string
  menuItems: {label: string; iconSrc?: string; onClick: any}[]
  data: any
}

function MenuActionsDropdown({id, menuItems, data}: MenuActionsDropdownProps) {
  return (
    <div>
      <MenuButton
        id={id}
        menuItems={menuItems}
        onClick={() => {}}
        isCustomTrigger={true}
        customData={data}
      >
        <div className={classes.actionsBox}>
          <img src={threeDots} className={classes.actionsDropdown} />
        </div>
      </MenuButton>
    </div>
  )
}

Button.MenuButton = MenuButton
Button.ActionsDropdown = MenuActionsDropdown

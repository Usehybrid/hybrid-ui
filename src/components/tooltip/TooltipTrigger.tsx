/**
 * @author Pratik Awaik <pratik@hybr1d.io>
 */

import clsx from 'clsx'
import classes from './styles.module.css'

interface TooltipTriggerProps {
  /**
   * tooltip trigger
   */
  children: React.ReactNode
  /**
   * The tooltip API object.
   */
  api?: any
  customStyles?: React.CSSProperties
}

export function TooltipTrigger({children, api,customStyles={}}: TooltipTriggerProps) {
  return (
    <button {...api.triggerProps} type="button" className={classes.trigger} style={{...customStyles}}>
      {children}
    </button>
  )
}

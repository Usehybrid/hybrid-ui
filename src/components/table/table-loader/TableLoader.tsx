import classes from './styles.module.css'

export default function TableLoader({text = 'Getting data...'}: {text?: string}) {
  return (
    <div className={classes.box}>
      <div className={classes.loader}>{text}</div>
    </div>
  )
}

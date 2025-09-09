import { CalendarDotsProps } from '../../../types/main'

const CalendarDateDots = ({ colors, dayLength = 2 }: CalendarDotsProps) => {
  const adjust = dayLength === 1 ? -5 : -9
  return (
    <div style={{ position: 'relative', height: 8, marginTop: 2 }}>
      {colors.map((color, idx) => (
        <span
          key={idx}
          className="calendar-date-dot"
          style={{
            backgroundColor: color,
            left: `calc(50% + ${(idx - (colors.length - 1) / 2) * 8}px + ${adjust}px)`,
          }}
        />
      ))}
    </div>
  )
}

export default CalendarDateDots

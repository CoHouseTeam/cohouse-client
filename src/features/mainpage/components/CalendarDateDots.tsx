import { CalendarDotsProps } from '../../../types/main'

const CalendarDateDots = ({ colors }: CalendarDotsProps) => {
  return (
    <div className="absolute h-1 w-full mt-1.5">
      {colors.map((color, idx) => (
        <span
          key={idx}
          className="calendar-date-dot"
          style={{
            backgroundColor: color,
            left: `calc(50% + ${(idx - (colors.length - 1) / 2) * 8}px)`,
          }}
        />
      ))}
    </div>
  )
}

export default CalendarDateDots

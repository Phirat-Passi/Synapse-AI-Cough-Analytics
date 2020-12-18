const MILLISECONDS_PER_MINUTE = 1000 * 60
const MILLISECONDS_PER_HOUR = MILLISECONDS_PER_MINUTE * 60
const MILLISECONDS_PER_DAY = MILLISECONDS_PER_HOUR * 24

function lastNByPeriod(n, period) {
  const now = new Date().getTime()
  return [...Array(n).keys()].map(i => new moment(now - i * period))
}

function lastNDays(n) {
  return lastNByPeriod(n, MILLISECONDS_PER_DAY).map(day => [day.clone().startOf('day'), day.clone().endOf('day')])
}

function lastNHours(n) {
  return lastNByPeriod(n, MILLISECONDS_PER_HOUR).map(hour => [hour.clone().startOf('hour'), hour.clone().endOf('hour')])
}

function lastNMinutes(n) {
  return lastNByPeriod(n, MILLISECONDS_PER_MINUTE).map(min => [min.clone().startOf('hour'), min.clone().endOf('hour')])
}

import Event from './event'
import ErrorEvent from './error-event'
import AckEvent from './ack-event'

export * from './interfaces'

type Events = Event<any, any> | ErrorEvent<any> | AckEvent

export { Event, ErrorEvent, AckEvent, Events }

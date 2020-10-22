import { v4 as uuidv4 } from 'uuid'
import { IAckEvent, IEvent } from './interfaces'

export default class AckEvent implements IAckEvent {
    static readonly type: 'acknowledgement' = 'acknowledgement'

    readonly type: 'acknowledgement' = AckEvent.type

    readonly edc: '1.0' = '1.0'

    readonly id: string

    readonly trigger: string

    constructor(causeId: string)

    constructor(cause: IEvent<any, any>)

    constructor(iAck: IAckEvent)

    constructor(arg: IAckEvent | IEvent<any, any> | string) {
        if (typeof arg === 'string') {
            this.id = uuidv4()
            this.trigger = arg
        } else if (arg.type === 'acknowledgement') {
            const ackEvent = <IAckEvent>arg

            this.id = ackEvent.id
            this.trigger = ackEvent.trigger
        } else {
            this.id = uuidv4()
            this.trigger = arg.id
        }
    }
}

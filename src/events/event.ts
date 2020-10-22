import { v4 as uuidv4 } from 'uuid'
import { AckEvent, ErrorEvent } from '.'
import { EventProps, IErrorDetails, IEvent } from './interfaces'

export default class Event<T, K> implements IEvent<T, K> {
    type: string

    readonly edc: '1.0' = '1.0'

    readonly id: string

    acknowledge?: boolean

    trigger?: string

    details?: T

    shared?: K

    constructor(...args: [type: string] | [event: IEvent<T, K>] | [type: string, props: EventProps<T, K>]) {
        if (typeof args[0] === 'string') {
            ;[this.type] = args
            this.id = uuidv4()
            if (args[1] !== undefined) {
                this.acknowledge = args[1].acknowledge
                this.details = args[1].details
                if (args[1].shared) this.shared = args[1].shared
                this.trigger = args[1].trigger
            }
        } else {
            const event = args[0]

            this.type = event.type
            this.id = event.id
            this.acknowledge = event.acknowledge
            this.trigger = event.trigger
            this.details = event.details

            if (event.shared) this.shared = event.shared
        }
    }

    inherit(cause: IEvent<any, K>) {
        this.trigger = cause.id
        if (cause.shared) this.shared = cause.shared
        return this
    }

    createAcknowledgment() {
        return new AckEvent(this)
    }

    createError<A>(errorDetails: { cn: string; code: number; message: string; data: A }) {
        return new ErrorEvent<A>(this, errorDetails)
    }

    caused<A>(type: string, props?: EventProps<A, K>) {
        if (props) return new Event<A, K>(type, props).inherit(this)

        return new Event<A, K>(type).inherit(this)
    }

    causedV2<A extends Event<any, K>>(constructor: new (...args: any[]) => A, ...args: any[]): A {
        return new constructor(args).inherit(this)
    }
}

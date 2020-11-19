import 'mocha'
import { expect, assert } from 'chai'
import { AckEvent, Event, ErrorEvent, EdcValidator } from '../src'

type Details = { foo: string; bar: number }
type Shared = { who?: string; where: string }

const commonEvent = new Event<Details, Shared>('test-event', {
    acknowledge: true,
    details: {
        bar: 100,
        foo: 'string here'
    },
    shared: {
        where: 'to',
        who: 'from'
    }
})

describe('Test Event Objects', () => {
    it('Event type', async () => {
        const type = 'test-type'
        const sharedId = 'sharedId'

        const cause = new Event(type, {
            shared: {
                id: sharedId
            }
        })

        const event = new Event<any, { id: string }>('inherit-test').inherit(cause)

        assert(event.trigger === cause.id, 'new event.trigger must == cause.id')
        assert(event.shared?.id === sharedId, 'The new event must copy the shared data')

        assert(cause.type === type, 'Type must be set during construction')
    })
    it('AckEvent', async () => {
        const ack = new AckEvent(commonEvent)

        const valid = EdcValidator.validate(ack)

        assert(valid, 'Must be a valid AckEvent')
        assert(ack.trigger === commonEvent.id, 'new event.trigger must == cause.id')
        assert(ack.type === 'acknowledgement', 'event.type must be "acknowledgement"')
    })
    it('ErrorEvent', async () => {
        const error = new ErrorEvent(commonEvent, {
            cn: 'cn',
            code: 400,
            data: {
                test: 'test'
            },
            message: 'simple message'
        })

        const valid = EdcValidator.validate(error)

        assert(valid, 'Must be a valid ErrorEvent')
        assert(error.trigger === commonEvent.id, 'new event.trigger must == cause.id')
        assert(error.type === 'error', 'event.type must be "error"')
        assert(error.details, 'Error Event must incude the details')
        assert(error.details.data?.test === 'test', 'Error Event must incude the details.data.test')
        assert(error.details.failed, 'failed event must be included in error')
        assert(error.details.failed === JSON.stringify(commonEvent), 'failed must be the string version of the cause')

        const failedEvent = JSON.parse(error.details.failed || '{}')

        assert(failedEvent.id === commonEvent.id, 'Failed event id must match cause')
    })

    it('ErrorEvent static type', async () => {
        const error = new ErrorEvent(commonEvent, {
            cn: 'cn',
            code: 400,
            data: {
                test: 'test'
            },
            message: 'simple message'
        })

        assert(error.type === ErrorEvent.type, 'Type must be set during construction')
    })
    it('AckEvent static type', async () => {
        const ack = new AckEvent(commonEvent)

        assert(ack.type === AckEvent.type, 'Type must be set during construction')
    })

    it('Event inherit()', async () => {
        const event1 = new Event('test-1', {
            shared: {
                foo: 'baz',
                x: 1
            }
        })

        const event2 = new Event('test-2', {
            shared: {
                foo: 'bar',
                y: 2
            }
        })

        event2.inherit(event1)

        assert(
            event2.shared?.foo === event1.shared?.foo,
            `Event2's foo should have been overwritten by inherit, ${event2.shared?.foo}`
        )
        assert(event2.shared?.y === 2, `Event2's y should not have been touched`)
        // @ts-ignore
        assert(event2.shared?.x === 1, `Event2' should have inherited x from Event1:  ${event2.shared?.x}`)
    })
    it('Event caused()', async () => {
        const event = commonEvent.caused(
            new Event('new-event', {
                shared: {
                    tet: '',
                    where: '',
                    who: ''
                },
                details: {
                    test: 'this'
                }
            })
        )

        assert(event.details?.test === 'this', 'created event has the correct details')

        assert(event.trigger === commonEvent.id, 'new event.trigger must == cause.id')
        assert(event.shared?.where === commonEvent.shared?.where, 'The new event must copy the shared data')

        const anotherEvent = commonEvent.caused(
            new Event('second-event', {
                shared: {
                    where: ''
                }
            })
        )

        assert(anotherEvent.trigger === commonEvent.id, 'new event.trigger must == cause.id')
        assert(event.shared?.where === commonEvent.shared?.where, 'The new event must copy the shared data')
    })
    it('Event createError()', async () => {
        const event = commonEvent.createError({
            cn: 'cn',
            code: 1000,
            message: 'Simple message',
            data: {
                fish: 'boat'
            }
        })

        assert(event.trigger === commonEvent.id, 'new event.trigger must == cause.id')
        assert(event.details.data?.fish === 'boat', 'The new event must copy the shared data')
    })
    it('Event createAcknowledgment()', async () => {
        const event = commonEvent.createAcknowledgment()

        assert(event.trigger === commonEvent.id, 'ack trigger must equal cause id')
        assert(event.type === 'acknowledgement', 'type must be acknowledgement')
    })
})

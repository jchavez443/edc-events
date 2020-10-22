import 'mocha'
import { expect, assert } from 'chai'
import { EdcValidator, Event, AckEvent, ErrorEvent } from '../src'

type Details = { foo: string; bar: number }
type Shared = { who: string; where: string }

const commonEvent = new Event<Details, Shared>('test-event', {
    acknowledge: true,
    details: {
        bar: 100,
        foo: 'string here'
    }
})

describe('Test Event Objects', () => {
    it('Validate Event', async () => {
        const event = new Event<Details, Shared>('test-event', {
            acknowledge: true,
            details: {
                bar: 100,
                foo: 'string here'
            }
        })

        const valid = EdcValidator.validate(event)

        assert(valid, 'The event is NOT a valid Event')
    })
    it('Validate AckEvent', async () => {
        const ack = new AckEvent('causeId')

        const valid = EdcValidator.validate(ack)

        assert(valid, 'The ack is a valid AckEvent')

        const ack2 = new AckEvent(commonEvent)

        const valid2 = EdcValidator.validate(ack2)

        assert(valid2, 'The ack is NOT a valid AckEvent from event')
    })
    it('Validate ErrorEvent', async () => {
        const error = new ErrorEvent({
            cn: 'cn',
            code: 1234,
            message: 'simple message',
            failed: JSON.stringify(commonEvent)
        })

        const valid = EdcValidator.validate(error)

        assert(valid, 'The error is NOT a valid ErrorEvent')
    })

    it('Invalid Event', async () => {
        const event = {
            type: 'test-vent'
        }

        const valid = EdcValidator.validate(event)

        assert(!valid, 'The error is a valid Event')
    })
    it('Invalid ErrorEvent', async () => {
        const event = {
            type: 'error'
        }

        const valid = EdcValidator.validate(event)

        assert(!valid, 'The error is a valid ErrorEvent')
    })
    it('Invalid AckEvent', async () => {
        const event = {
            type: 'acknowledge'
        }

        const valid = EdcValidator.validate(event)

        assert(!valid, 'The error is a valid AckEvent')
    })
    it('Invalid AckEvent, extra property', async () => {
        const event = {
            type: 'acknowledge',
            edc: '1.0',
            id: 'id',
            trigger: 'triggerId',
            acknowledge: true
        }

        const valid = EdcValidator.validate(event)

        assert(!valid, 'The error is a valid AckEvent, should NOT be because of extra property')
    })

    it('Invalid Event, detailed', async () => {
        const event = {
            type: 'test-vent'
        }

        const details = EdcValidator.detailedValidate(event)

        assert(!details.valid, 'The error is a valid Event')
        assert(details.errors?.length === 2, 'only one error should be found')
    })
    it('Invalid ErrorEvent, detailed', async () => {
        const event = {
            type: 'error'
        }

        const details = EdcValidator.detailedValidate(event)

        assert(!details.valid, 'The error is a valid ErrorEvent')
        assert(details.errors?.length === 2, 'only one error should be found')
    })
    it('Invalid AckEvent, detailed', async () => {
        const event = {
            id: 1000,
            type: 'acknowledge',
            trigger: 'triggerId'
        }

        const details = EdcValidator.detailedValidate(event)

        assert(!details.valid, 'The error is a valid AckEvent')
        assert(details.errors?.length === 2, `only one error should be found, but got ${details.errors?.length}`)
    })

    it('Invalid Event, extra property', async () => {
        const event = {
            edc: '1.0',
            id: 'id',
            type: 'test-event',
            test: 'invalid additional property'
        }

        const details = EdcValidator.detailedValidate(event)

        assert(!details.valid, 'The error is a valid event')
    })
})

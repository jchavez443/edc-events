import Ajv, { ValidateFunction } from 'ajv'
import { EventSchema, ErrorEventSchema, AckEventSchema } from './json-schema'

const ajv = new Ajv()
const eventValidator = ajv.compile(EventSchema)
const errorEventValidator = ajv.compile(ErrorEventSchema)
const ackEventValidator = ajv.compile(AckEventSchema)

const ajvDetailed = new Ajv({
    allErrors: true
})

export default class EdcValidator {
    public static validate(jsObj: any): boolean {
        if (!jsObj) return false

        if (jsObj.type === 'error') {
            return errorEventValidator(jsObj)
        }

        if (jsObj.type === 'acknowledge') {
            return ackEventValidator(jsObj)
        }

        return eventValidator(jsObj)
    }

    public static detailedValidate(jsObj: any) {
        if (!jsObj) {
            return {
                valid: false,
                errors: [{ message: 'object is falsey' }]
            }
        }

        let tempValidator: ValidateFunction

        if (jsObj.type === 'error') {
            tempValidator = ajvDetailed.compile(ErrorEventSchema)
        } else if (jsObj.type === 'acknowledge') {
            tempValidator = ajvDetailed.compile(AckEventSchema)
        } else {
            tempValidator = ajvDetailed.compile(EventSchema)
        }

        const valid = tempValidator(jsObj)
        const { errors } = tempValidator

        const details = {
            valid,
            errors
        }

        return details
    }
}

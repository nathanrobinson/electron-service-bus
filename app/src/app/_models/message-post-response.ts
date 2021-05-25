export class MessagePostResponse {

    constructor (status?: number) {
        this.id = status || 0;
    }

    id: number;
    get description(): string {
        return this._descriptions[this.id] || this._descriptions[0];
    }

    private _descriptions: {[key: number]: string} = {
        0: 'Unknown',
        201: 'Message successfully sent to queue or topic',
        400: 'Bad request',
        401: 'Authorization failure',
        403: 'Quota exceeded or message too large',
        410: 'Specified queue or topic does not exist',
        500: 'Internal error'
    };
}
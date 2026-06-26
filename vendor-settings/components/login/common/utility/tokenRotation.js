import md5 from 'md5'
import { v4 as uuid } from "uuid";

export const _tokenGenerationForPublicAPIs = ()=>{
    try {
        let result = uuid();
        return {'token': md5(process.env.PUBLIC_API_SECRET+result), 'passPhrase': result}
    } catch (error) {
        console.error(error)
    }
}
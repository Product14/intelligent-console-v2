import { handleGetRequest } from './handleGetReq';
import { handlePostRequest } from './handlePostReq';
import { handleDeleteRequest } from './handleDeleteReq';
import { handlePatchRequest } from './handlePatchReq';
import { handlePutRequest } from './handlePutReq';
const CentralAPIHandler = {
    handleGetRequest,
    handlePostRequest,
    handleDeleteRequest,
    handlePatchRequest,
    handlePutRequest
}


export default CentralAPIHandler;
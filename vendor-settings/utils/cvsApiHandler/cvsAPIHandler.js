import { handleDeleteRequest } from './cvsDeleteRequest';
import { handleGetRequest } from './cvsGetRequest';
import { handlePatchRequest } from './cvsPatchRequest';
import { handlePostRequest } from './cvsPostRequest';
import { handlePutRequest } from './cvsPutRequest';

const CVSAPIHandler = {
  handleGetRequest,
  handlePostRequest,
  handleDeleteRequest,
  handlePutRequest,
  handlePatchRequest,
};

export default CVSAPIHandler;

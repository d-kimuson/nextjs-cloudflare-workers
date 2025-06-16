import "@typespec/http";
import "./SharedErrors.tsp";

using TypeSpec.Http;

model SuccessResponseBody<Params, Response> {
  request: {
    parameters: Params
  };
  result: Response
}

namespace SharedResponse {
  alias GetResponse<Params, Response> = {
    @statusCode status: 200;
    @body body: SuccessResponseBody<Params, Response>;
  };
}

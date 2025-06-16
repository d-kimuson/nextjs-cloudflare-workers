import "@typespec/http";

using TypeSpec.Http;

model ErrorResponseBody {
  request: {
    parameters: Record<string>
  },
  result: {
    status: int32;
    message: string;
    errors: Record<string>;
  }
}

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
  } | {
    @statusCode status: 400 | 401 | 403 | 500;
    @body body: ErrorResponseBody
  };
}

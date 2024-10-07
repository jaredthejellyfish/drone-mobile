import {
  CognitoIdentityProviderClient,
  InitiateAuthCommand,
} from "@aws-sdk/client-cognito-identity-provider";
import { AUTH_CLIENT_ID, AUTH_REGION_ID } from "./constants";
import got from "got";
import { DRONE_ACCOUNT_BASE_URL } from "./constants";

interface GetSessionTokenParams {
  username: string;
  password: string;
}

export const getSessionToken = async ({
  username,
  password,
}: GetSessionTokenParams): Promise<string> => {
  const client = new CognitoIdentityProviderClient({ region: AUTH_REGION_ID });

  const command = new InitiateAuthCommand({
    AuthFlow: "USER_PASSWORD_AUTH",
    ClientId: AUTH_CLIENT_ID,
    AuthParameters: {
      USERNAME: username,
      PASSWORD: password,
    },
  });

  try {
    const response = await client.send(command);
    const idToken = response.AuthenticationResult?.IdToken;

    if (!idToken) {
      throw new Error("Authentication failed: IdToken is missing");
    }

    return idToken;
  } catch (error) {
    throw new Error(`Authentication failed: ${(error as Error).message}`);
  }
};

interface ApiRequestOptions {
  path: string;
  body: Record<string, unknown>;
  accessToken: string;
}

interface ApiResponse<T> {
  statusCode: number;
  result: T;
}

export const apiRequest = async <T>({
  path,
  body,
  accessToken,
}: ApiRequestOptions): Promise<ApiResponse<T>> => {
  try {
    const response = await got<T>({
      url: `${DRONE_ACCOUNT_BASE_URL}${path}`,
      method: "POST",
      json: body,
      throwHttpErrors: false,
      headers: {
        "content-type": "application/json;charset=UTF-8",
        "x-drone-api": accessToken,
      },
      responseType: "json",
    });

    return {
      statusCode: response.statusCode,
      result: response.body,
    };
  } catch (error) {
    throw new Error(`API request failed: ${(error as Error).message}`);
  }
};

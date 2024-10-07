import { EventEmitter } from 'events';
import got from 'got';
import logger from './logger';
import { DRONE_BASE_URL } from './constants';
import { getSessionToken, apiRequest } from './utils';
import type { ResultsEntity, VehicleResponse } from './interfaces';

interface DroneMobileConfig {
  username: string;
  password: string;
}

interface SessionInfo {
  accessToken: string | null;
}

type VehicleOptions =
  | {
      all: true;
      limit?: never;
      offset?: never;
    }
  | {
      all?: false;
      limit?: number;
      offset?: number;
    };

class DroneMobile extends EventEmitter {
  private config: DroneMobileConfig;
  public sessionInfo: SessionInfo = {
    accessToken: null,
  };

  private constructor(config: DroneMobileConfig) {
    super();
    logger.debug('Constructor called');
    this.config = config;
  }

  public static async create(config: DroneMobileConfig): Promise<DroneMobile> {
    const instance = new DroneMobile(config);
    await instance.login();
    return instance;
  }

  /**
   * Login to the API and get an access token for subsequent requests
   */
  public async login(): Promise<void> {
    logger.debug('Logging into the API');
    const { username, password } = this.config;

    const accessToken = await getSessionToken({ username, password });
    this.sessionInfo.accessToken = accessToken;

    logger.debug('Access token obtained');
  }

  /**
   * Gets the current list of vehicles tied to the account
   */
  public async vehicles(opts?: VehicleOptions): Promise<ResultsEntity[]> {
    logger.debug('Fetching vehicles from API');
    const { accessToken } = this.sessionInfo;

    if (!accessToken) {
      throw new Error('Not logged in');
    }

    const { all = true, limit = 100, offset = 0 } = opts ?? {};

    const sendReq = async (limit: number, offset: number): Promise<VehicleResponse> => {
      const response = await got<VehicleResponse>({
        url: `${DRONE_BASE_URL}/api/v1/vehicle?limit=${limit}&offset=${offset}`,
        throwHttpErrors: false,
        headers: {
          authorization: `Bearer ${accessToken}`,
        },
        responseType: 'json',
      });

      if (response.statusCode !== 200) {
        throw new Error(`Failed to get vehicles: ${response.statusCode}`);
      }

      return response.body;
    };

    const vehicles: ResultsEntity[] = [];
    const response = await sendReq(limit, offset);
    vehicles.push(...response.results);

    if (all && response.count > limit) {
      const numOfRequests = Math.ceil(response.count / limit) - 1;
      const requests = Array.from({ length: numOfRequests }, (_, i) => {
        return sendReq(limit, (i + 1) * limit);
      });
      const results = await Promise.all(requests);
      results.forEach((result) => {
        vehicles.push(...result.results);
      });
    }

    return vehicles;
  }

  /**
   * Sends a command to the vehicle
   * @param vehicleId Id of the vehicle to target
   * @param command Command to send
   */
  private async sendCommand(vehicleId: string, command: string): Promise<string> {
    logger.debug(`Sending command '${command}' to vehicle '${vehicleId}'`);

    const { accessToken } = this.sessionInfo;

    if (!accessToken) {
      throw new Error('Not logged in');
    }

    const response = await apiRequest({
      path: '/api/iot/send-command',
      body: { deviceKey: vehicleId, command },
      accessToken,
    });

    if (response.statusCode !== 200) {
      logger.error(response.result);
      throw new Error('Command failed');
    }

    return `${command} command was successful!`;
  }

  /**
   * Starts the vehicle
   * @param vehicleId Id of the vehicle to target
   */
  public async start(vehicleId: string): Promise<string> {
    return this.sendCommand(vehicleId, 'remote_start');
  }

  /**
   * Stops the vehicle
   * @param vehicleId Id of the vehicle to target
   */
  public async stop(vehicleId: string): Promise<string> {
    return this.sendCommand(vehicleId, 'remote_stop');
  }

  /**
   * Locks the vehicle
   * @param vehicleId Id of the vehicle to target
   */
  public async lock(vehicleId: string): Promise<string> {
    return this.sendCommand(vehicleId, 'arm');
  }

  /**
   * Unlocks the vehicle
   * @param vehicleId Id of the vehicle to target
   */
  public async unlock(vehicleId: string): Promise<string> {
    return this.sendCommand(vehicleId, 'disarm');
  }

  /**
   * Opens the trunk of the vehicle
   * @param vehicleId Id of the vehicle to target
   */
  public async trunk(vehicleId: string): Promise<string> {
    return this.sendCommand(vehicleId, 'trunk');
  }

  /**
   * Triggers the AUX1 action on the vehicle
   * @param vehicleId Id of the vehicle to target
   */
  public async aux1(vehicleId: string): Promise<string> {
    return this.sendCommand(vehicleId, 'remote_aux1');
  }

  /**
   * Triggers the AUX2 action on the vehicle
   * @param vehicleId Id of the vehicle to target
   */
  public async aux2(vehicleId: string): Promise<string> {
    return this.sendCommand(vehicleId, 'remote_aux2');
  }

  /**
   * Gets the location of the vehicle
   * @param vehicleId Id of the vehicle to target
   */
  public async location(vehicleId: string): Promise<any> {
    logger.debug('Getting vehicle location');
    return this.sendCommand(vehicleId, 'location');
  }

  /**
   * Gets the status of the vehicle
   * @param vehicleId Id of the vehicle to target
   */
  public async status(vehicleId: string): Promise<ResultsEntity | undefined> {
    logger.debug('Getting vehicle status');
    const vehicles = await this.vehicles({ all: true });
    return vehicles.find((item) => item.device_key === vehicleId);
  }
}

export default DroneMobile;

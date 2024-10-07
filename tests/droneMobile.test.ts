import { expect, test, beforeAll, afterAll } from 'bun:test';
import DroneMobile from '../src/index';
import { config } from 'dotenv';

config();

let droneMobile: DroneMobile;
let vehicleId: string;

beforeAll(async () => {
  droneMobile = await DroneMobile.create({
    username: process.env.DRONEMOBILE_USERNAME!,
    password: process.env.DRONEMOBILE_PASSWORD!,
  });

  const vehicles = await droneMobile.vehicles();
  if (vehicles.length > 0) {
    vehicleId = vehicles[0].device_key;
  } else {
    throw new Error('No vehicles found for this account.');
  }
});

afterAll(() => {
  // Clean up resources if needed
});

test('DroneMobile instance should be created and logged in', () => {
  expect(droneMobile).toBeDefined();
  expect(droneMobile.sessionInfo.accessToken).not.toBeNull();
});

test('Should fetch vehicles', async () => {
  const vehicles = await droneMobile.vehicles();
  expect(vehicles).toBeDefined();
  expect(vehicles.length).toBeGreaterThan(0);
  expect(vehicles[0]).toHaveProperty('device_key');
});

test('Should start the vehicle', async () => {
  const response = await droneMobile.start(vehicleId);
  expect(response).toBe('remote_start command was successful!');
});

test('Should stop the vehicle', async () => {
  const response = await droneMobile.stop(vehicleId);
  expect(response).toBe('remote_stop command was successful!');
});

test.only('Should lock the vehicle', async () => {
  const response = await droneMobile.lock(vehicleId);
  expect(response).toBe('arm command was successful!');
});

test('Should unlock the vehicle', async () => {
  const response = await droneMobile.unlock(vehicleId);
  expect(response).toBe('disarm command was successful!');
});

test('Should get vehicle status', async () => {
  const status = await droneMobile.status(vehicleId);
  expect(status).toBeDefined();
  expect(status?.device_key).toBe(vehicleId);
});

test('Should handle invalid command', async () => {
  try {
    await (droneMobile as any).sendCommand(vehicleId, 'invalid_command');
  } catch (error) {
    expect(error).toBeDefined();
    expect((error as Error).message).toBe('Command failed');
  }
});

test('Should get vehicle location', async () => {
  const location = await droneMobile.location(vehicleId);
  expect(location).toBeDefined();
  // Add more assertions based on the expected structure of the location data
});

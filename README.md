# DroneMobile SDK

**DroneMobile SDK** is a TypeScript library that provides a seamless interface to interact with the Drone-Mobile API. It leverages modern technologies, including the latest AWS SDK (v3), Bun for building and publishing, and Pino for efficient logging. This SDK simplifies the process of managing your Drone-Mobile account, controlling vehicles, and retrieving vehicle data.

## Table of Contents

- [Features](#features)
- [Installation](#installation)
- [Configuration](#configuration)
- [Usage](#usage)
  - [Initialization](#initialization)
  - [Methods](#methods)
    - [Login](#login)
    - [Fetch Vehicles](#fetch-vehicles)
    - [Control Vehicle](#control-vehicle)
    - [Get Vehicle Status](#get-vehicle-status)
    - [Get Vehicle Location](#get-vehicle-location)
- [Logging](#logging)
- [Testing](#testing)
- [Building and Publishing](#building-and-publishing)
- [Contributing](#contributing)
- [License](#license)

## Features

- **AWS SDK v3 Integration**: Utilizes the latest AWS SDK for secure and efficient authentication.
- **Pino Logging**: High-performance logging with configurable levels.
- **Bun-Based Build and Publish**: Fast bundling and publishing using Bun's powerful tools.
- **Comprehensive Testing**: Jest-compatible test runner with support for TypeScript.
- **TypeScript Support**: Strong typing ensures reliability and ease of use.

## Installation

### Prerequisites

- **Node.js**: Ensure you have Node.js (v12 or higher) installed.
- **Bun**: Install Bun by following the [official installation guide](https://bun.sh/).

### Steps

1. **Clone the Repository**

   ```bash
   git clone https://github.com/your-username/drone-mobile-sdk.git
   cd drone-mobile-sdk
   ```

2. **Install Dependencies**

   Using Bun:

   ```bash
   bun install
   ```

   This will install all necessary dependencies, including:

   - `@aws-sdk/client-cognito-identity-provider`
   - `got`
   - `pino`
   - `typescript` (as a dev dependency)
   - `@types/node` (as a dev dependency)

## Configuration

### Environment Variables

Create a `.env` file in the root directory to store your Drone-Mobile credentials securely:

```bash
touch .env
```

Add the following variables to `.env`:

```env
DRONEMOBILE_USERNAME=your-username
DRONEMOBILE_PASSWORD=your-password
```

**Note**: Ensure `.env` is added to your `.gitignore` to prevent committing sensitive information.

## Usage

### Initialization

First, import the `DroneMobile` class and initialize it with your credentials.

```typescript
import DroneMobile from 'drone-mobile-sdk';

const droneMobile = await DroneMobile.create({
  username: 'your-username',
  password: 'your-password',
});
```

### Methods

#### Login

The SDK automatically handles login during initialization. However, you can manually trigger a login if needed.

```typescript
await droneMobile.login();
```

#### Fetch Vehicles

Retrieve a list of all vehicles associated with your account.

```typescript
const vehicles = await droneMobile.vehicles();
console.log('Vehicles:', vehicles);
```

**Options:**

```typescript
interface VehicleOptions {
  all?: boolean; // Whether to fetch all vehicles recursively (default: true)
  limit?: number; // Maximum number of vehicles to fetch (default: 100)
  offset?: number; // Number of vehicles to skip (default: 0)
}
```

**Example:**

```typescript
const vehicles = await droneMobile.vehicles({ all: true, limit: 50, offset: 0 });
```

#### Control Vehicle

Control various aspects of a vehicle using its `device_key`.

**Start Vehicle**

```typescript
const response = await droneMobile.start('vehicle-device-key');
console.log(response); // 'remote_start command was successful!'
```

**Stop Vehicle**

```typescript
const response = await droneMobile.stop('vehicle-device-key');
console.log(response); // 'remote_stop command was successful!'
```

**Lock Vehicle**

```typescript
const response = await droneMobile.lock('vehicle-device-key');
console.log(response); // 'arm command was successful!'
```

**Unlock Vehicle**

```typescript
const response = await droneMobile.unlock('vehicle-device-key');
console.log(response); // 'disarm command was successful!'
```

**Open Trunk**

```typescript
const response = await droneMobile.trunk('vehicle-device-key');
console.log(response); // 'trunk command was successful!'
```

**AUX Actions**

```typescript
const aux1Response = await droneMobile.aux1('vehicle-device-key');
console.log(aux1Response); // 'remote_aux1 command was successful!'

const aux2Response = await droneMobile.aux2('vehicle-device-key');
console.log(aux2Response); // 'remote_aux2 command was successful!'
```

#### Get Vehicle Status

Retrieve the current status of a specific vehicle.

```typescript
const status = await droneMobile.status('vehicle-device-key');
console.log('Vehicle Status:', status);
```

**Returns:**

An object containing detailed status information about the vehicle.

#### Get Vehicle Location

Retrieve the current location of a specific vehicle.

```typescript
const location = await droneMobile.location('vehicle-device-key');
console.log('Vehicle Location:', location);
```

**Returns:**

An object containing latitude, longitude, speed, and other location-related data.

### Full Example

```typescript
import DroneMobile from 'drone-mobile-sdk';

(async () => {
  try {
    // Initialize the SDK
    const droneMobile = await DroneMobile.create({
      username: 'your-username',
      password: 'your-password',
    });

    // Fetch all vehicles
    const vehicles = await droneMobile.vehicles();
    console.log('Vehicles:', vehicles);

    if (vehicles.length === 0) {
      console.log('No vehicles found.');
      return;
    }

    const vehicleId = vehicles[0].device_key;

    // Start the vehicle
    const startResponse = await droneMobile.start(vehicleId);
    console.log(startResponse);

    // Get vehicle status
    const status = await droneMobile.status(vehicleId);
    console.log('Vehicle Status:', status);

    // Stop the vehicle
    const stopResponse = await droneMobile.stop(vehicleId);
    console.log(stopResponse);
  } catch (error) {
    console.error('An error occurred:', error);
  }
})();
```

## Logging

**DroneMobile SDK** uses **Pino** for logging, providing high-performance and configurable logging capabilities.

### Configuration

The logger can be configured via environment variables and the `logger.ts` file.

- **Environment Variables:**
  - `LOG_LEVEL`: Sets the logging level (`fatal`, `error`, `warn`, `info`, `debug`, `trace`). Default is `info`.
  - `NODE_ENV`: Set to `production` to disable pretty-printing and output logs in JSON format.

### Usage

The logger is automatically integrated into the SDK. You can control the verbosity by setting the `LOG_LEVEL` environment variable.

```typescript
import logger from './logger';

logger.info('This is an info message');
logger.error('This is an error message');
```

### Example Configuration

```typescript
// logger.ts
import pino from 'pino';

const isProduction = process.env.NODE_ENV === 'production';

const logger = pino({
  level: process.env.LOG_LEVEL || 'info',
  ...(isProduction
    ? {}
    : {
        transport: {
          target: 'pino-pretty',
          options: {
            colorize: true,
            translateTime: 'yyyy-mm-dd HH:MM:ss',
            ignore: 'pid,hostname',
          },
        },
      }),
});

export default logger;
```

## Testing

The project uses **Bun's** built-in Jest-compatible test runner for testing. Tests are written in TypeScript and support features like lifecycle hooks and mocking.

### Writing Tests

Tests are located in the `tests/` directory and follow the naming patterns:

- `*.test.ts`
- `*_test.ts`
- `*.spec.ts`
- `*_spec.ts`

### Example Test

```typescript
// tests/droneMobile.test.ts
import { expect, test, beforeAll, afterAll } from 'bun:test';
import DroneMobile from '../src/index';
import { ResultsEntity } from '../src/interfaces';
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

test('Should lock the vehicle', async () => {
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
```

### Running Tests

Execute all tests with:

```bash
bun test
```

**Additional Test Runner Flags:**

- **Run Specific Tests:**

  ```bash
  bun test --test-name-pattern 'Should start the vehicle'
  ```

- **Watch Mode:**

  ```bash
  bun test --watch
  ```

- **Update Snapshots:**

  ```bash
  bun test --update-snapshots
  ```

## Building and Publishing

The project uses **Bun** for building and publishing the package to npm. Below are the steps to compile your TypeScript code into a single JavaScript file and publish the package.

### Step 1: Build Your Package

Bun's built-in bundler can compile and bundle your TypeScript files into a single JavaScript file.

```bash
bun build src/index.ts --outdir dist --target bun --no-splitting --minify
```

**Explanation:**

- `src/index.ts`: Entry point of your application.
- `--outdir dist`: Output directory for the bundled file.
- `--target bun`: Specifies Bun as the target environment.
- `--no-splitting`: Disables code splitting to ensure a single output file.
- `--minify`: Minifies the output code for optimized performance.

**Alternative Configuration with `bunfig.toml`:**

```toml
# bunfig.toml
[build]
entrypoints = ["./src/index.ts"]
outdir = "./dist"
target = "bun"
no-splitting = true
minify = true
```

Now, you can simply run:

```bash
bun build
```

### Step 2: Generate Type Definitions

While Bun's bundler doesn't generate `.d.ts` files, you can use the TypeScript compiler to generate them.

1. **Install TypeScript:**

   ```bash
   bun add -d typescript
   ```

2. **Create or Update `tsconfig.json`:**

   Ensure your `tsconfig.json` includes the following:

   ```json
   {
     "compilerOptions": {
       "declaration": true,
       "emitDeclarationOnly": true,
       "outDir": "dist",
       "rootDir": "src",
       "strict": true,
       "skipLibCheck": true,
       "esModuleInterop": true
     },
     "include": ["src/**/*"]
   }
   ```

3. **Generate Type Definitions:**

   ```bash
   bun x tsc
   ```

   This will generate `.d.ts` files in the `dist` directory.

### Step 3: Update `package.json`

Ensure your `package.json` points to the correct entry points.

```json
{
  "main": "dist/index.js",
  "types": "dist/index.d.ts",
  "files": ["dist"],
  "scripts": {
    "build": "bun build",
    "type:build": "bun x tsc",
    "prepublishOnly": "bun run build && bun run type:build",
    "test": "bun test"
  }
}
```

### Step 4: Publish to npm

1. **Log In to npm:**

   ```bash
   bun pm login
   ```

   Follow the prompts to authenticate.

2. **Publish Your Package:**

   ```bash
   bun publish
   ```

   **Note:** If your package is scoped (e.g., `@your-username/package-name`), you might need to set the access level to public:

   ```bash
   bun publish --access public
   ```

3. **Verify the Publish:**

   After publishing, verify your package on [npm](https://www.npmjs.com/) by searching for your package name.

### Step 5: Test Your Package Locally (Optional)

Before publishing, it's good practice to test your package locally.

1. **Pack Your Package:**

   ```bash
   bun pm pack
   ```

   This creates a `package.tgz` file.

2. **Install the Packed Package in a Test Project:**

   ```bash
   bun add ../path-to-your-package/package.tgz
   ```

3. **Verify Functionality:**

   Create a simple project to import and use your SDK to ensure everything works as expected.

## Contributing

Contributions are welcome! Please follow these steps to contribute to the DroneMobile SDK:

1. **Fork the Repository**

2. **Create a Feature Branch**

   ```bash
   git checkout -b feature/your-feature-name
   ```

3. **Commit Your Changes**

   ```bash
   git commit -m "Add your feature"
   ```

4. **Push to the Branch**

   ```bash
   git push origin feature/your-feature-name
   ```

5. **Open a Pull Request**

   Describe your changes and submit the pull request for review.

### Guidelines

- **Code Quality**: Ensure your code follows TypeScript best practices and is well-documented.
- **Testing**: Write tests for new features and ensure existing tests pass.
- **Documentation**: Update the README and other documentation as needed.

## License

This project is licensed under the [MIT License](LICENSE).

---

## Contact

For any questions, issues, or feature requests, please open an issue on [GitHub](https://github.com/your-username/drone-mobile-sdk/issues)

---

**Happy Coding!**
'use strict';

const functions = require('firebase-functions/v1');
const { initializeApp } = require('firebase-admin/app');

// We need to initialize the app before importing modules that want Firestore.
initializeApp();

const android = require('./android');
const legacy = require('./legacy');

// functions.config() was removed in firebase-functions v7, so the region is read from the
// environment. The CLI does not expose functions/.env to the deploy-time source analysis,
// so this default is what decides where the functions are deployed.
const region = process.env.REGION || 'europe-west1';
const regionalFunctions = functions.region(region).runWith({ timeoutSeconds: 10 });

// These must be imported before the handlers to ensure they are initialized correctly
process.env.DEBUG = (process.env.DEBUG === 'true').toString();
process.env.REGION = region;

const { handleRequest, handleCheckRateLimits } = require('./handlers');

exports.androidV1 = regionalFunctions.https.onRequest(async (req, res) =>
  handleRequest(req, res, android.createPayload),
);

exports.sendPushNotification = regionalFunctions.https.onRequest(async (req, res) =>
  handleRequest(req, res, legacy.createPayload),
);

exports.checkRateLimits = regionalFunctions.https.onRequest(async (req, res) =>
  handleCheckRateLimits(req, res),
);

exports.handleRequest = handleRequest;
exports.handleCheckRateLimits = handleCheckRateLimits;

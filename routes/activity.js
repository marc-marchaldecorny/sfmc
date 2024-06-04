"use strict";
import { neru, Messages, Scheduler, State, Voice } from "neru-alpha";
import util from "util";

export const logExecuteData = [];

export default function logData(req) {
  logExecuteData.push({
    body: req.body,
    headers: req.headers,
    trailers: req.trailers,
    method: req.method,
    url: req.url,
    params: req.params,
    query: req.query,
    route: req.route,
    cookies: req.cookies,
    ip: req.ip,
    path: req.path,
    host: req.hostname,
    fresh: req.fresh,
    stale: req.stale,
    protocol: req.protocol,
    secure: req.secure,
    originalUrl: req.originalUrl,
  });
  // console.log('✅ logData headers: ' + util.inspect(req.headers));
  console.log("✅ logData body: " + util.inspect(req.body));
  // console.log('logData req.body.keyValue: ' + req.body.keyValue);
}

export function edit(req, res) {
  console.log("🚀 Edit");
  logData(req);
  res.status(200).send({
    status: true,
  });
}

export function save(req, res) {
  console.log("🚀 Save");

  logData(req);

  res.status(200).send({
    status: true,
  });
}

export async function execute(req, res) {
  console.log("🚀 Execute:", req.body);

  logData(req);
  res.status(200).send({
    status: true,
  });
}

export function publish(req, res) {
  console.log("🚀 Publish");
  logData(req);
  res.status(200).send({
    status: true,
  });
}

export function validate(req, res) {
  console.log("🚀 Validate");
  logData(req);
  res.status(200).send({
    status: true,
  });
}

export function stop(req, res) {
  console.log("🚀 Stop");

  logData(req);
  res.status(200).send({
    status: true,
  });
}

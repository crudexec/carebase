"use client";
import { AppProgressBar } from "next-nprogress-bar";
import React from "react";

const ProgressBar = () => (
  <AppProgressBar
    height="2px"
    color="#2463EB"
    options={{ showSpinner: true }}
    shallowRouting
  />
);

export default ProgressBar;

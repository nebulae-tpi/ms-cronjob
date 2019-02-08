#!/bin/bash

# FrontEnd - EMI composition
nebulae compose-ui development --shell-type=FUSE2_ANGULAR --shell-repo=https://github.com/nebulae-tpi/emi --frontend-id=emi --output-dir=emi  --setup-file=../etc/mfe-setup.json

# API - EMI GateWay composition
nebulae compose-api development --api-type=NEBULAE_GATEWAY --api-repo=https://github.com/nebulae-tpi/emi-gateway --api-id=emi-gateway --output-dir=emi-gateway  --setup-file=../etc/mapi-setup.json
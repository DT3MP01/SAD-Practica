#!/bin/bash

# Cluster variables
CLUSTERNAME="forge"
REFERENCEDOMAIN="vera.kumori.cloud"
CLUSTERCERT="cluster.core/wildcard-vera-kumori-cloud"
KUMORICTL_CMD="kam ctl"
KAM_CMD="kam"
# Service variables
INBOUNDNAME="sadnodeinb"
DEPLOYNAME="sadnodedep"
DOMAIN="sadnodedomain"
SERVICEURL="sad-node-${CLUSTERNAME}.${REFERENCEDOMAIN}"

case $1 in

'refresh-dependencies')
  cd manifests
  ${KAM_CMD} mod dependency --delete kumori.systems/kumori
  ${KAM_CMD} mod dependency kumori.systems/kumori/@1.0.11
  ${KAM_CMD} mod relink       
  cd ..
  ;;

'create-domain')
  ${KUMORICTL_CMD} register domain $DOMAIN --domain $SERVICEURL
  ;;

'deploy-inbound')
  ${KUMORICTL_CMD} register inbound $INBOUNDNAME \
    --domain $DOMAIN \
    --cert $CLUSTERCERT
  ;;

'deploy-service')
  ${KUMORICTL_CMD} register deployment $DEPLOYNAME \
    --deployment ./manifests/deployment \
    --comment "Sad service deploy" \
    --wait 5m
  ;;

'dry-run')
  time ${KUMORICTL_CMD} register deployment $DEPLOYNAME \
    --deployment ./manifests/deployment \
    --wait 5m --dry-run --keep-tmp-files
  ;;

# Before use this option, you must change the deployment manifest
'update-service')
  ${KUMORICTL_CMD} update deployment $DEPLOYNAME \
    --deployment ./manifests/deployment \
    --comment "Updating Sad service" \
    --wait 5m
  ;;

'link')
  ${KUMORICTL_CMD} link $DEPLOYNAME:sad $INBOUNDNAME:inbound
  ;;

'describe')
  ${KUMORICTL_CMD} describe deployment $DEPLOYNAME
  echo
  echo
  ${KUMORICTL_CMD} describe deployment $INBOUNDNAME
  ;;

'unlink')
  ${KUMORICTL_CMD} unlink $DEPLOYNAME:sad $INBOUNDNAME:inbound
  ;;

'undeploy-service')
  ${KUMORICTL_CMD} unregister deployment $DEPLOYNAME --wait 5m
  ;;

'undeploy-inbound')
  ${KUMORICTL_CMD} unregister deployment $INBOUNDNAME --wait 5m
  ;;

'delete-domain')
  ${KUMORICTL_CMD} unregister domain $DOMAIN
  ;;

# Undeploy all (secrets, inbounds, deployments)
'undeploy-all')
  ${KUMORICTL_CMD} unlink $DEPLOYNAME:sad $INBOUNDNAME:inbound
  ${KUMORICTL_CMD} unregister deployment $DEPLOYNAME --wait 5m
  ${KUMORICTL_CMD} unregister deployment $INBOUNDNAME --wait 5m
  ${KUMORICTL_CMD} unregister domain $DOMAIN
  ;;

*)
  echo "This script doesn't contain that command"
	;;

esac
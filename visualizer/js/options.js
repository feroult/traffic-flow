const VEHICLES_UPDATE_PERIOD = 250; // fade the weights of old points on the map by a unit every 1 second, keep head points
const VEHICLES_FADEOUT_PERIOD = 5000; // start fading all points, including head points, after 5 sec

const DUPLICHECK_PERIOD = 30000; // keep ckecking ackIds for duplicates for 30 sec after first arrival
const DUPLICKECK_CLEANING_PERIOD = 1333; // check duplicates database for old entries to clean every 1.3 sec

const PROJECT_ID = 'traffic-flow-app';
const TOPIC_ID = 'projects/traffic-flow-app/topics/events';

const PUBSUB_SUBSCRIPTION_NAME = 'traffic-flow-web';
const PUBSUB_SUBSCRIPTION = 'projects/traffic-flow-app/subscriptions/dashboard';

const PUBSUB_MAXMESSAGES = 1000; // number of messages to get from PubSub at once
const PUBSUB_MAXCONCURRENT = 5; // number of concurrent requests to PubSub
const PUBSUB_RETRY_PERIOD = 2000; // retry before the 90sec timeout to make system responsive to new data

const DASHBOARD_UPDATE_PERIOD = 400 // dashboard update frequency in ms
const DASHBOARD_NODATA_MSG_AFTER = 6000 // dashboard displays "no data" after 6 seconds without data
const DASBOARD_DATASTATUS_VIEW_SCROLL_PERIOD = 1000 // min time required before datastatus debug view can scroll
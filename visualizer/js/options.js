const VEHICLES_FADEOUT_PERIOD = 15000; // start fading all points, including head points, after 15 sec

const PROJECT_ID = 'traffic-flow-app';
const TOPIC_ID = 'projects/traffic-flow-app/topics/visualizer';

const PUBSUB_SUBSCRIPTION_NAME = 'traffic-flow-web';
const PUBSUB_SUBSCRIPTION = 'projects/traffic-flow-app/subscriptions/dashboard';

const PUBSUB_MAXMESSAGES = 1000; // number of messages to get from PubSub at once
const PUBSUB_MAXCONCURRENT = 5; // number of concurrent requests to PubSub
const PUBSUB_RETRY_PERIOD = 2000; // retry before the 90sec timeout to make system responsive to new data

const DASHBOARD_UPDATE_PERIOD = 400 // dashboard update frequency in ms
const DASHBOARD_NODATA_MSG_AFTER = 6000 // dashboard displays "no data" after 6 seconds without data
const DASBOARD_DATASTATUS_VIEW_SCROLL_PERIOD = 1000 // min time required before datastatus debug view can scroll
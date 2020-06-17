#!/bin/sh

LOCAL_PLUGIN="$HOME/Code/kong-plugin-mocking/kong/plugins/mocking"

docker cp  $LOCAL_PLUGIN kong-ent1:/usr/local/share/lua/5.1/kong/plugins
docker exec -ti kong-ent1 /bin/sh -c "KONG_PLUGINS='bundled,mocking' kong reload"
docker cp  $LOCAL_PLUGIN kong-ent2:/usr/local/share/lua/5.1/kong/plugins
docker exec -ti kong-ent2 /bin/sh -c "KONG_PLUGINS='bundled,mocking' kong reload"
docker cp  $LOCAL_PLUGIN kong-ent3:/usr/local/share/lua/5.1/kong/plugins
docker exec -ti kong-ent3 /bin/sh -c "KONG_PLUGINS='bundled,mocking' kong reload"

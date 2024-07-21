# round-robin

## Development

To run the app, use the following command:

```
npm run dev
```

```
# start mariadb docker container
docker-compose up

mysql --host 0.0.0.0 -u roundrobin -p


```

```

# list all speakers
curl http://localhost:8000/api/speaker | jq


# create meetings

curl -X POST -H "Content-Type: application/json"  http://localhost:8000/api/meeting -d '{"name": "my other meeting" }'

curl -X POST -H "Content-Type: application/json"  http://localhost:8000/api/meeting -d '{"name": "my great meeting" }'


# get meeting by code

curl http://localhost:8000/api/meeting/k6h-lsb-npl

curl http://localhost:8000/api/meeting/k6h-lsb-npl | jq

```

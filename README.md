# Round Robin

## A web application to streamline and enhance daily standup meetings for distributed teams

The application’s architecture includes a server, a database, and a client-side application (user interface). Communication between a client and the server happens via REST API, and via websockets. Websockets allow multiple users to get updates in real time.

To run the application, use the following command:

```bash
npm run dev
```

## Testing

Run server tests in watch mode

```bash
npm run test -- --watch
```

## Database

To run the database in a docker container, use the following command:

```bash
docker-compose up
```

To open MariaDB shell:

```bash
docker-compose exec db mariadb -uroot -ppassword roundrobin
```

```sql
show databases;
show tables;
describe meeting;
describe speaker;
describe meeting_speaker;
select * from meeting;
```

To rebuild the DB after a change (e.g. adding a field):

```bash
docker-compose rm
docker volume prune
docker-compose up
```

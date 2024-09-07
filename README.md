# round-robin

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

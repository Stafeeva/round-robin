# round-robin

To run the application, use the following command:

```
npm run dev
```

## Database

To run the database in a docker container, use the following command:

```
docker-compose up
```

To open MariaDB shell:

```
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

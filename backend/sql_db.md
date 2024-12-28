# Добавление view *load_status_today*

Добавление данного view в базу данных необходимо для просмотра на frontend'е пункта меню `Статус текущих загрузок`. Если
не добавить данный view, то будут возникать ошибки при попытке просмотра данного пункта, однако все остальные пункты
должны работать корректно.  
Используя код ниже в качестве примера, необходимо добавить для используемой схемы view *load_status_today*.   
В данном
примере используется схема **fw**. Если используется другая схема, нужно заменить в коде ниже подстроки `fw.` на нужную
схему.

```sql
CREATE OR REPLACE VIEW fw.load_status_today
AS SELECT o.load_group,
o.object_id AS "id объекта",
o.object_name AS "Имя таблицы",
o.object_desc AS "Описание загрузки",
ls.load_status AS "Статус загрузки",
li.row_cnt AS "Загружено записей",
timezone('Europe/Moscow'::text, timezone('UTC'::text, li.updated_dttm)) AS "Последнее обновление"
FROM fw.objects o
LEFT JOIN fw.load_info li ON o.object_id = li.object_id AND li.updated_dttm::date = 'now'::text::date
LEFT JOIN fw.d_load_status ls ON li.load_status = ls.load_status
WHERE (o.load_group IN ( SELECT d_load_group.load_group
FROM fw.d_load_group)) AND o.active
ORDER BY o.object_id;
```
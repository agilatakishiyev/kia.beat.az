import { MigrationInterface, QueryRunner, Table } from "typeorm";

export class mymigration1601796851334 implements MigrationInterface {

    public async up (queryRunner: QueryRunner): Promise<void> {
        await queryRunner.createTable(
            new Table({
                name: "user",
                columns: [
                    {
                        name: "id",
                        type: "int",
                        isPrimary: true
                    },
                    {
                        name: "name",
                        type: "varchar",
                    },
                    {
                        name: "surname",
                        type: "varchar"
                    }
                ]
            })
            , true
        );

        await queryRunner.createTable(
            new Table({
                name: "image",
                columns: [
                    {
                        name: "id",
                        type: "int",
                        isPrimary: true
                    },
                    {
                        name: "date",
                        type: "date",
                    },
                    {
                        name: "image",
                        type: "varchar"
                    }
                ]
            })
            , true
        );
    }

    public async down (queryRunner: QueryRunner): Promise<void> {
    }

}

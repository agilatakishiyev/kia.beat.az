import { Entity, PrimaryGeneratedColumn, Column } from "typeorm";

@Entity()
export class Image {
    @PrimaryGeneratedColumn()
    id!: number;

    @Column()
    date!: Date;

    @Column()
    image!: string;
}

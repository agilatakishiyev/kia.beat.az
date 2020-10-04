import { Entity, PrimaryGeneratedColumn, Column } from "typeorm";

@Entity()
export class GeneratedImage {
    @PrimaryGeneratedColumn()
    id!: number;

    @Column()
    date!: Date;

    @Column()
    image!: string;
}

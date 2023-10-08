import {AbstractEntity} from "./abstarct.entity";
import {Column, Entity} from "typeorm";

@Entity({name: 'news'})
export class NewsEntity extends AbstractEntity {
    @Column()
    title: string;

    @Column()
    desc: string;

    @Column()
    version: string;
}
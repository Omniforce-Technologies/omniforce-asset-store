import {Column, Entity, JoinColumn, ManyToOne, OneToMany} from "typeorm";
import {AbstractEntity} from "./abstarct.entity";
import {LangEnum} from "../enum/lang.enum";
import {AssetEntity} from "./asset.entity";

@Entity({name: "assetTranslate"})
export class AssetTranslateEntity extends AbstractEntity {
    @Column({ enum: LangEnum, length: 5 })
    public language: LangEnum;

    @Column()
    public title: string;

    @Column()
    public desc: string;

    @ManyToOne(() => AssetEntity, (assetTranslate) => assetTranslate.translations, { onDelete: 'CASCADE' })
    public asset: AssetEntity;
}
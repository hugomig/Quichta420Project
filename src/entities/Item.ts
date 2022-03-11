import { Column, Entity, ManyToOne, PrimaryGeneratedColumn, JoinColumn } from 'typeorm';
import { Invitation } from './Invitation';

export enum ItemType {
    NonAlcoholicDrink = 'Non-alcoholic drink',
    AlcoholicDrink = 'Alcoholic drink',
    Food = 'Food',
    Game = 'Game',
    Accessory = 'Accessory',
    Other = 'Other'
}

@Entity()
export class Item{
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @Column({type: 'enum', enum: ItemType, default: ItemType.Other})
    type: ItemType;

    @Column()
    name: string;

    @Column({nullable: true})
    description: string;

    @Column({ default: 1 })
    quantity: number;

    @ManyToOne(() => Invitation, invitation => invitation.broughtItems, {nullable: false, onDelete: 'CASCADE', eager: true})
    @JoinColumn()
    invitation: Invitation;
}
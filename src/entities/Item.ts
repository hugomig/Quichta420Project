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

export interface FilteredItem {
    id: string,
    type: ItemType,
    name: string,
    description: string,
    quantity: number,
    invitation: string
}

export const filterItem = (item: Item) => {
    return {
        id: item.id,
        type: item.type,
        name: item.name,
        description: item.description,
        quantity: item.quantity,
        invitation: item.invitation.id
    }
}
import { Column, Entity, ManyToOne, OneToMany, PrimaryGeneratedColumn } from 'typeorm';
import { Party } from './Party';
import { User } from './User';
import { Item } from './Item';

export enum UserRole {
    Organizer = 'organizer',
    Invitor = 'invitor',
    Participant = 'participant'
}

@Entity()
export class Invitation {
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @Column({ default: false })
    accepted: boolean;

    @Column({type: 'enum', enum: UserRole})
    role: UserRole;

    @ManyToOne(() => Party, party => party.invitations, {nullable: false})
    party: Party;

    @ManyToOne(() => User, user => user.invitations, {nullable: false})
    user: User;

    @OneToMany(() => Item, item => item.invitation)
    broughtItems: Item[];
}
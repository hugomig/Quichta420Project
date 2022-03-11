import { Column, Entity, JoinColumn, ManyToOne, OneToMany, PrimaryGeneratedColumn, Unique } from 'typeorm';
import { Party } from './Party';
import { User } from './User';
import { Item } from './Item';

export enum UserRole {
    Organizer = 'organizer',
    Invitor = 'invitor',
    Participant = 'participant'
}

@Entity()
@Unique(["party", "user"])
export class Invitation {
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @Column({ default: false })
    accepted: boolean;

    @Column({type: 'enum', enum: UserRole, default: UserRole.Participant})
    role: UserRole;

    @ManyToOne(() => Party, party => party.invitations, {nullable: false, onDelete: 'CASCADE', eager: true})
    @JoinColumn()
    party: Party;

    @ManyToOne(() => User, user => user.receivedInvitations, {nullable: false, onDelete: 'CASCADE', eager: true})
    @JoinColumn()
    user: User;

    @ManyToOne(() => User, user => user.sentInvitations, {nullable: false, onDelete: 'CASCADE', eager: true})
    @JoinColumn()
    invitor: User;

    @OneToMany(() => Item, item => item.invitation)
    broughtItems: Item[];
}
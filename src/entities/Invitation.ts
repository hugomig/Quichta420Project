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

export const filterInvitation: (invitation: Invitation) => FilteredInvitation = (invitation) => {
    return {
        id: invitation.id,
        user: invitation.user.username,
        party: invitation.party,
        invitor: invitation.invitor.username,
        accepted: invitation.accepted,
        role: invitation.role
    }
}

export interface FilteredInvitation {
    id: string,
    user: string,
    party: Party,
    invitor: string,
    accepted: boolean,
    role: string
}
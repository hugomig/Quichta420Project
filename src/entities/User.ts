import { Column, Entity, OneToMany, PrimaryGeneratedColumn } from 'typeorm';
import { Invitation } from './Invitation';
import { Party } from './Party';

export enum RelationshipStatus{
    Single = 'single',
    InRelationship = 'in a relationship',
    Maried = 'maried',
    NotYourBusiness = 'not your business'
}

@Entity()
export class User {
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @Column()
    firstname: string;

    @Column()
    lastname: string;

    @Column({ unique: true })
    username: string;

    @Column({ unique: true })
    email: string;

    @Column()
    password: string;

    @Column()
    birthdate: Date;

    @Column({type: 'enum', enum: RelationshipStatus, default: RelationshipStatus.NotYourBusiness})
    relationshipStatus: RelationshipStatus;

    @OneToMany(() => Party, party => party.creator)
    parties: Party[];

    @OneToMany(() => Invitation, invitation => invitation.user)
    receivedInvitations: Invitation[];

    @OneToMany(() => Invitation, invitation => invitation.invitor)
    sentInvitations: Invitation[];
}

export interface FilteredUser {
    id: string,
    username: string,
    firstname: string,
    lastname: string,
    relationshipStatus: RelationshipStatus
}

export const filterUser: (user: User) => FilteredUser = (user) => {
    return {
        id: user.id,
        username: user.username,
        firstname: user.firstname,
        lastname: user.lastname,
        relationshipStatus: user.relationshipStatus
    }
}

export interface LightFilteredUser {
    id: string,
    username: string,
    firstname: string,
    lastname: string,
    email: string,
    birthdate: Date,
    relationshipStatus: RelationshipStatus
}

export const lightFilterUser: (user: User) => LightFilteredUser = (user) => {
    return {
        id: user.id,
        username: user.username,
        firstname: user.firstname,
        lastname: user.lastname,
        email: user.email,
        birthdate: user.birthdate,
        relationshipStatus: user.relationshipStatus
    }
}
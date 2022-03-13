import { Column, Entity, ManyToOne, OneToMany, PrimaryGeneratedColumn, JoinColumn } from 'typeorm';
import { Invitation } from './Invitation';
import { User } from './User';

@Entity()
export class Party {
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @Column()
    name: string;

    @Column()
    location: string;

    @Column()
    date: Date;

    @Column()
    description: string;

    @Column({ nullable: true })
    minimumAge?: number;

    @Column({ nullable: true })
    maximumAge?: number;

    @ManyToOne(() => User, user => user.parties, { nullable: false, onDelete: 'CASCADE', eager: true })
    @JoinColumn()
    creator: User;

    @OneToMany(() => Invitation, invitation => invitation.party)
    invitations: Invitation[];
}

export interface FilteredParty {
    id: string,
    name: string
    location: string,
    date: Date,
    description: string,
    minimumAge?: number,
    maximumAge?: number
    creator: string
}

export const filterParty: (party: Party) => FilteredParty = (party) => {
    return {
        id: party.id,
        name: party.name,
        location: party.location,
        date: party.date,
        description: party.description,
        minimumAge: party.minimumAge,
        maximumAge: party.maximumAge,
        creator: party.creator.username
    };
}
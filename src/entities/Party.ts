import { Column, Entity, ManyToOne, OneToMany, PrimaryGeneratedColumn } from 'typeorm';
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
    minimumAge: number;

    @Column({ nullable: true })
    maximumAge: number;

    @ManyToOne(() => User, user => user.parties, { nullable: false })
    creator: User;

    @OneToMany(() => Invitation, invitation => invitation.party)
    invitations: Invitation[];
}
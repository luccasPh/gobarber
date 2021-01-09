import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { isToday, format, parseISO, isAfter, isBefore } from 'date-fns';
import ptBR from 'date-fns/locale/pt-BR';
import DayPicker, { DayModifiers } from 'react-day-picker';
import Skeleton, { SkeletonTheme } from 'react-loading-skeleton';

import { FiClock, FiPower } from 'react-icons/fi';
import { Link } from 'react-router-dom';
import { useAuth } from '../../hooks/auth';
import logoImg from '../../assets/logo.svg';
import api from '../../services/api';
import Notification from './Notification';

import 'react-day-picker/lib/style.css';
import 'react-perfect-scrollbar/dist/css/styles.css';
import {
  Container,
  Header,
  HeaderContent,
  Profile,
  Content,
  Schedule,
  NextAppointment,
  Section,
  Appointment,
  Calendar,
} from './styles';

interface MonthAvailabilityItem {
  day: number;
  available: boolean;
}

interface AppointmentItem {
  id: string;
  date: string;
  hour: string;
  user: {
    name: string;
    surname: string;
    avatar: string;
  };
}

const Dashboard: React.FC = () => {
  const { signOut, user } = useAuth();

  const [selectedDate, setSelectedDate] = useState(new Date());
  const [selectedMonth, setSelectedMonth] = useState(new Date());
  const [
    loadingProviderAppointments,
    setLoadingProviderAppointments,
  ] = useState(true);
  const [loadingMonthAvailability, setLoadingMonthAvailability] = useState(
    true,
  );
  const [monthAvailability, setMonthAvailability] = useState<
    MonthAvailabilityItem[]
  >([]);
  const [providerAppointments, setProviderAppointments] = useState<
    AppointmentItem[]
  >([]);

  useEffect(() => {
    api
      .get('/providers/month-availability', {
        params: {
          provider_id: user.id,
          month: selectedMonth.getMonth() + 1,
          year: selectedMonth.getFullYear(),
        },
      })
      .then((response) => {
        setMonthAvailability(response.data);
        setLoadingMonthAvailability(false);
      })
      .catch((error) => {
        if (error.response.status && error.response.status === 401) {
          signOut();
        }
      });
  }, [selectedMonth, signOut, user]);

  useEffect(() => {
    api
      .get<AppointmentItem[]>('/providers/me', {
        params: {
          day: selectedDate.getDate(),
          month: selectedMonth.getMonth() + 1,
          year: selectedMonth.getFullYear(),
        },
      })
      .then((response) => {
        const providerAppointmentsFormatted = response.data.map(
          (appointment) => {
            return {
              ...appointment,
              hour: format(parseISO(appointment.date), 'HH:mm'),
            };
          },
        );
        setProviderAppointments(providerAppointmentsFormatted);
        setLoadingProviderAppointments(false);
      })
      .catch((error) => {
        if (error.response.status === 401) {
          signOut();
        }
      });
  }, [selectedDate, selectedMonth, signOut, user]);

  const handleDateChange = useCallback((day: Date, modifiers: DayModifiers) => {
    if (modifiers.available && !modifiers.disabled) {
      setSelectedDate(day);
    }
  }, []);

  const handleMonthChange = useCallback((month: Date) => {
    setSelectedMonth(month);
  }, []);

  const disabledDays = useMemo(() => {
    const dates = monthAvailability
      .filter((monthDay) => monthDay.available === false)
      .map((monthDay) => {
        const year = selectedMonth.getFullYear();
        const month = selectedMonth.getMonth();

        return new Date(year, month, monthDay.day);
      });

    return dates;
  }, [monthAvailability, selectedMonth]);

  const selectedDateAsText = useMemo(() => {
    const value = format(selectedDate, "'Dia' dd 'de' MMM", {
      locale: ptBR,
    });
    return (
      value.substring(0, 10) +
      value.substring(10, 11).toUpperCase() +
      value.substring(11)
    );
  }, [selectedDate]);

  const selectedWeekDayText = useMemo(() => {
    const tmp = format(selectedDate, 'cccc', { locale: ptBR });
    const value = tmp.substring(0, 1).toUpperCase() + tmp.substring(1);
    return `${value}-feira`;
  }, [selectedDate]);

  const morningAppointments = useMemo(() => {
    return providerAppointments.filter((appointment) => {
      return parseISO(appointment.date).getHours() < 12;
    });
  }, [providerAppointments]);

  const afternoonAppointments = useMemo(() => {
    return providerAppointments.filter((appointment) => {
      return parseISO(appointment.date).getHours() >= 12;
    });
  }, [providerAppointments]);

  const nextAppointment = useMemo(() => {
    return providerAppointments.find((appointment) =>
      isAfter(parseISO(appointment.date), new Date()),
    );
  }, [providerAppointments]);

  return (
    <Container>
      <Header>
        <HeaderContent>
          <img src={logoImg} alt="GoBarbe" />

          <Profile>
            <img src={user.avatar} alt={`${user.name} ${user.surname}`} />

            <div>
              <span>Bem-vindo,</span>
              <Link to="/profile">
                <strong>
                  {user.name} {user.surname}
                </strong>
              </Link>
            </div>
          </Profile>

          <div className="right-buttons">
            <Notification />

            <button type="button" onClick={signOut}>
              <FiPower />
            </button>
          </div>
        </HeaderContent>
      </Header>

      <Content>
        <Schedule>
          <h1>Horários agendados</h1>
          <p>
            {isToday(selectedDate) && <span>Hoje</span>}
            <span>{selectedDateAsText}</span>
            <span>{selectedWeekDayText}</span>
          </p>
          {!loadingProviderAppointments ? (
            isToday(selectedDate) &&
            nextAppointment && (
              <NextAppointment>
                <strong>Atendimento a seguir</strong>
                <div>
                  <img
                    src={nextAppointment.user.avatar}
                    alt={`${nextAppointment.user.name} ${nextAppointment.user.surname}`}
                  />

                  <strong>
                    {nextAppointment.user.name} {nextAppointment.user.surname}
                  </strong>
                  <span>
                    <FiClock />
                    {nextAppointment.hour}
                  </span>
                </div>
              </NextAppointment>
            )
          ) : (
            <SkeletonTheme color="#28262E" highlightColor="#444">
              <Skeleton style={{ height: 134, marginTop: 60 }} />
            </SkeletonTheme>
          )}
          <Section>
            <strong>Manhã</strong>
            {!loadingProviderAppointments ? (
              [
                morningAppointments.length === 0 && (
                  <p key="no-appointments-morning">
                    Nenhum agendamento neste período
                  </p>
                ),

                morningAppointments.map((appointment) => (
                  <Appointment
                    key={appointment.id}
                    style={
                      isBefore(parseISO(appointment.date), new Date())
                        ? { opacity: 0.4 }
                        : {}
                    }
                  >
                    <span>
                      <FiClock />
                      {appointment.hour}
                    </span>

                    <div>
                      <img
                        src={appointment.user.avatar}
                        alt={`${appointment.user.name} ${appointment.user.surname}`}
                      />

                      <strong>
                        {appointment.user.name} {appointment.user.surname}
                      </strong>
                    </div>
                  </Appointment>
                )),
              ]
            ) : (
              <SkeletonTheme color="#28262E" highlightColor="#444">
                <Skeleton style={{ height: 88 }} />
              </SkeletonTheme>
            )}
          </Section>

          <Section>
            <strong>Tarde</strong>
            {!loadingProviderAppointments ? (
              [
                afternoonAppointments.length === 0 && (
                  <p key="no-appointments-afternoon">
                    Nenhum agendamento neste período
                  </p>
                ),

                afternoonAppointments.map((appointment) => (
                  <Appointment
                    key={appointment.id}
                    style={
                      isBefore(parseISO(appointment.date), new Date())
                        ? { opacity: 0.4 }
                        : {}
                    }
                  >
                    <span>
                      <FiClock />
                      {appointment.hour}
                    </span>

                    <div>
                      <img
                        src={appointment.user.avatar}
                        alt={`${appointment.user.name} ${appointment.user.surname}`}
                      />

                      <strong>
                        {appointment.user.name} {appointment.user.surname}
                      </strong>
                    </div>
                  </Appointment>
                )),
              ]
            ) : (
              <SkeletonTheme color="#28262E" highlightColor="#444">
                <Skeleton style={{ height: 88 }} />
              </SkeletonTheme>
            )}
          </Section>
        </Schedule>

        <Calendar>
          {!loadingMonthAvailability ? (
            <DayPicker
              weekdaysShort={['D', 'S', 'T', 'Q', 'Q', 'S', 'S']}
              fromMonth={new Date()}
              disabledDays={[{ daysOfWeek: [0, 6] }, ...disabledDays]}
              modifiers={{
                available: { daysOfWeek: [1, 2, 3, 4, 5] },
              }}
              onMonthChange={handleMonthChange}
              selectedDays={selectedDate}
              onDayClick={handleDateChange}
              months={[
                'Janeiro',
                'Fevereiro',
                'Março',
                'Abril',
                'Maio',
                'Junho',
                'Julho',
                'Agosto',
                'Setembro',
                'Outubro',
                'Novembro',
                'Dezembro',
              ]}
            />
          ) : (
            <SkeletonTheme color="#28262E" highlightColor="#444">
              <Skeleton height={353} />
            </SkeletonTheme>
          )}
        </Calendar>
      </Content>
    </Container>
  );
};

export default Dashboard;

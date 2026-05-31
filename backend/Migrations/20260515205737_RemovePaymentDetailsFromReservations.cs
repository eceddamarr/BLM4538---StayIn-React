using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace StayinApi.Migrations
{
    /// <inheritdoc />
    public partial class RemovePaymentDetailsFromReservations : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.Sql("""
                UPDATE p
                SET
                    p.PaymentDate = COALESCE(r.PaymentDate, p.PaymentDate),
                    p.TransactionId = COALESCE(r.TransactionId, p.TransactionId)
                FROM Payments p
                INNER JOIN Reservations r ON r.Id = p.ReservationId
                WHERE r.PaymentDate IS NOT NULL OR r.TransactionId IS NOT NULL;
                """);

            migrationBuilder.DropColumn(
                name: "PaymentDate",
                table: "Reservations");

            migrationBuilder.DropColumn(
                name: "TransactionId",
                table: "Reservations");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<DateTime>(
                name: "PaymentDate",
                table: "Reservations",
                type: "datetime2",
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "TransactionId",
                table: "Reservations",
                type: "nvarchar(max)",
                nullable: true);

            migrationBuilder.Sql("""
                UPDATE r
                SET
                    r.PaymentDate = p.PaymentDate,
                    r.TransactionId = p.TransactionId
                FROM Reservations r
                INNER JOIN Payments p ON p.ReservationId = r.Id;
                """);
        }
    }
}

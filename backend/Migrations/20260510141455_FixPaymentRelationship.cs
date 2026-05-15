using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace StayinApi.Migrations
{
    /// <inheritdoc />
    public partial class FixPaymentRelationship : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_Payments_Reservations_ReservationId1",
                table: "Payments");

            migrationBuilder.DropIndex(
                name: "IX_Payments_ReservationId",
                table: "Payments");

            migrationBuilder.DropIndex(
                name: "IX_Payments_ReservationId1",
                table: "Payments");

            migrationBuilder.DropColumn(
                name: "ReservationId1",
                table: "Payments");

            migrationBuilder.CreateIndex(
                name: "IX_Payments_ReservationId",
                table: "Payments",
                column: "ReservationId",
                unique: true);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropIndex(
                name: "IX_Payments_ReservationId",
                table: "Payments");

            migrationBuilder.AddColumn<int>(
                name: "ReservationId1",
                table: "Payments",
                type: "int",
                nullable: true);

            migrationBuilder.CreateIndex(
                name: "IX_Payments_ReservationId",
                table: "Payments",
                column: "ReservationId");

            migrationBuilder.CreateIndex(
                name: "IX_Payments_ReservationId1",
                table: "Payments",
                column: "ReservationId1",
                unique: true,
                filter: "[ReservationId1] IS NOT NULL");

            migrationBuilder.AddForeignKey(
                name: "FK_Payments_Reservations_ReservationId1",
                table: "Payments",
                column: "ReservationId1",
                principalTable: "Reservations",
                principalColumn: "Id");
        }
    }
}

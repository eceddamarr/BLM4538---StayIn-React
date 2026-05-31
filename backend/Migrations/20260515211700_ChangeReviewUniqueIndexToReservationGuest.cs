using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace StayinApi.Migrations
{
    /// <inheritdoc />
    public partial class ChangeReviewUniqueIndexToReservationGuest : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropIndex(
                name: "IX_Reviews_ReservationId",
                table: "Reviews");

            migrationBuilder.CreateIndex(
                name: "IX_Reviews_ReservationId_GuestId",
                table: "Reviews",
                columns: new[] { "ReservationId", "GuestId" },
                unique: true);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropIndex(
                name: "IX_Reviews_ReservationId_GuestId",
                table: "Reviews");

            migrationBuilder.CreateIndex(
                name: "IX_Reviews_ReservationId",
                table: "Reviews",
                column: "ReservationId",
                unique: true);
        }
    }
}
